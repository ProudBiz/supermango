# Brainstorm Notes: LinkDigest

## Problem & Context
Slack 워크스페이스에서 팀원들이 공유하는 링크가 너무 많아 하나하나 읽기 어렵다. 이 문제를 해결하기 위해 링크를 자동으로 요약하고, 카드뉴스 형태의 비주얼 콘텐츠로 변환하며, 별도 SaaS 웹앱에서 채널별/워크스페이스별로 모아볼 수 있는 서비스를 만든다.

## User Stories Rationale
Slack Bot 스토리는 "링크 감지 → 요약 → 카드뉴스" 파이프라인에 집중했다. URL 캐싱은 요약 단위가 메시지이므로 v1에서 드롭했다 — 같은 URL이라도 다른 URL과 함께 묶이면 요약이 달라지기 때문에 URL 레벨 캐싱의 효과가 제한적이다. 웹앱은 단일 피드 페이지로 최대한 심플하게 가되, 태그 검색과 채널/워크스페이스 필터로 탐색성을 확보했다. 공유 기능은 바이럴 루프를 위해 공개 URL + OG 메타태그 + CTA를 포함했다.

## Design Decisions
**비주얼 톤:** Ralphthon 사이트 참고 — 딥 네이비 다크 배경, 대담한 타이포그래피, 노란색 액센트(CTA), 터미널/모노스페이스 요소. 이를 모바일 퍼스트 인스타그램 스타일 피드에 적용.

**피드 레이아웃:** 인스타그램 형식 — 카드뉴스 캐러셀 상단, 하단에 공유자/날짜/요약/태그. 무한스크롤. 하단 탭 바 없이 단일 피드 페이지로 운영.

**필터:** 상단 고정 — 워크스페이스 드롭다운, 채널 드롭다운(모든 채널/개별), 태그 검색 입력.

**Slack 메시지 형태:** 요약과 카드뉴스를 분리 — 불릿 3줄 요약 먼저, 카드뉴스 이미지 3장은 별도 스레드 메시지. 리액션 흐름: 👀(감지) → ✅(요약 완료) → 🖼️(카드뉴스 완료).

**공유 페이지:** 공유자/날짜 제외, 태그 + 캐러셀 + 요약 + CTA(랜딩페이지). OG 메타태그에 3줄 요약 + 카드뉴스 1번 이미지.

**피드 노출 조건:** 카드뉴스까지 완료된 메시지만 피드에 표시.

**Interaction States:**

| 기능 | LOADING | EMPTY | ERROR | SUCCESS |
|------|---------|-------|-------|---------|
| 피드 | 스켈레톤 카드 | "아직 공유된 링크가 없어요. Slack 채널에 봇을 초대해보세요!" + 가이드 링크 | "피드를 불러올 수 없습니다" + 재시도 버튼 | 카드 목록 무한스크롤 |
| 태그 검색 | 검색어 입력 중 스피너 | "일치하는 태그가 없습니다" | - | 태그 필터 적용된 피드 |
| 카드뉴스 캐러셀 | 이미지 플레이스홀더 | - | 깨진 이미지 → 대체 일러스트 | 3장 스와이프 |
| 공유 링크 생성 | 버튼 로딩 스피너 | - | "공유 링크 생성 실패" 토스트 | URL 복사 완료 토스트 |
| 공유 페이지 | 스켈레톤 | - | "이 링크는 더 이상 유효하지 않습니다" | 요약 + 캐러셀 + CTA |

## Tech Stack Rationale
**모노레포 (Turborepo):** 웹앱과 Slack Bot이 Supabase 클라이언트, 타입 정의 등을 공유하므로 모노레포가 적합. Turborepo는 캐싱과 병렬 빌드 지원.

**Next.js (App Router):** 모바일 퍼스트 웹앱에 SSR로 OG 메타태그 지원 필수 (공유 페이지). Context7에서 App Router 구조, API Routes, 미들웨어 패턴 확인.

**Bolt for JavaScript (Socket Mode):** Context7에서 `app.message()`, `client.reactions.add()`, 스레드 응답 API 확인. Socket Mode는 별도 URL 노출 없이 WebSocket으로 연결되어 개발/배포 단순화.

**Supabase:** PostgreSQL + Slack OAuth(OIDC) 공식 지원(`slack_oidc` provider) + Storage(카드뉴스 이미지). Context7에서 `signInWithOAuth({ provider: 'slack_oidc' })` API 확인.

**Gemini API:** 3줄 요약 + 태그 자동 생성용 LLM.

**Jina Reader:** URL 콘텐츠를 마크다운으로 변환. 직접 스크래핑 대비 페이월/JS 렌더링 페이지 대응력 우수, Puppeteer 불필요.

**Railway:** 웹앱과 Slack Bot 모두 Railway에 배포. 모노레포 내 서비스별 독립 배포 지원.

## Architecture Decisions
**모노레포 구조:**
```
apps/
  web/          — Next.js 웹앱 (피드, 랜딩, 공유 페이지)
  slack-bot/    — Bolt for JS (Socket Mode)
packages/
  shared/       — Supabase 클라이언트, 타입 정의, 유틸리티
```

**데이터 흐름:** Slack Bot이 메시지 감지 → Jina Reader로 URL 콘텐츠 추출 → Gemini로 요약+태그 생성 → 카드뉴스 이미지 생성 → Supabase DB에 저장 + Storage에 이미지 업로드 → Slack 스레드에 응답. 웹앱은 Supabase DB를 직접 조회.

**데이터 모델:**
```
workspace (Slack 워크스페이스)
  ├─ channel (채널)
  │    └─ message (링크 포함 메시지)
  │         ├─ url[] (메시지 내 URL들, 최대 5개)
  │         ├─ summary (3줄 요약 텍스트)
  │         ├─ card_images[] (카드뉴스 3장 이미지 URL)
  │         ├─ tags[] (자동 생성 태그)
  │         ├─ status (pending/summarized/complete/failed)
  │         └─ share_token (공유 링크용 고유 토큰)
  └─ user (Slack 사용자)
```

**이미지 저장:** Supabase Storage `card-images` 버킷 (public). 별도 환경 변수 불필요 — 기존 Supabase 키로 접근.

**인증:** Supabase Auth의 Slack OAuth(OIDC) — 웹앱 로그인 시 사용자의 워크스페이스 정보 획득.

## Environment Requirements
**API 키/서비스 (모두 .env에 설정 완료):**
- `SLACK_BOT_TOKEN` — Slack Bot OAuth token
- `SLACK_SIGNING_SECRET` — Slack 요청 검증
- `SLACK_APP_TOKEN` — Socket Mode WebSocket 연결
- `SLACK_CLIENT_ID` — Slack OAuth Client ID
- `SLACK_CLIENT_SECRET` — Slack OAuth Client Secret
- `SUPABASE_URL` — Supabase 프로젝트 URL
- `SUPABASE_ANON_KEY` — Supabase 클라이언트 키
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase 서버 키 (Storage 접근 포함)
- `GEMINI_API_KEY` — Gemini AI API
- `JINA_API_KEY` — Jina Reader API
- `SLACK_TEST_USER_TOKEN` — e2e 테스트용 사용자 토큰
- `SLACK_TEST_CHANNEL_ID` — e2e 테스트용 채널 ID

**외부 서비스 설정:**
- Supabase: `card-images` public 버킷 생성 완료
- Slack App: Socket Mode 활성화, Event Subscriptions (`message.channels`, `message.groups`)
- Supabase Auth: Slack OAuth(OIDC) provider 활성화 완료

## Risks & Mitigations
| 리스크 | 가능성 | 영향 | 완화 |
|--------|--------|------|------|
| Slack API rate limit | 중 | 중 | v1에서는 별도 처리 없음, 모니터링만 |
| Gemini API 지연/실패 | 중 | 고 | 타임아웃 + ❌ 리액션 + 실패 사유 안내 |
| 카드뉴스 이미지 생성 시간 | 고 | 중 | 요약과 카드뉴스 비동기 분리 |
| 스크래핑 차단 (페이월, 로그인 등) | 고 | 중 | Jina Reader 사용 + 실패 사유 안내 |
| Slack OAuth 토큰 만료 | 저 | 고 | Supabase Auth 자동 refresh |

## Live QA Playbook

### Surface: 웹앱 (피드, 필터, 로그인)
- **Method:** gstack
- **Setup:** `pnpm dev` (Next.js 로컬 서버)
- **Env vars:** `SUPABASE_URL`, `SUPABASE_ANON_KEY` (값은 .env)
- **Verification:** 피드 로딩, 무한스크롤, 태그 검색, 채널/워크스페이스 필터, Slack OAuth 로그인
- **Coder task:** N/A

### Surface: 공유 페이지
- **Method:** gstack
- **Setup:** 공유 URL 접속
- **Verification:** 캐러셀 표시, 요약 표시, CTA 동작, OG 메타태그 확인
- **Coder task:** N/A

### Surface: Slack Bot
- **Method:** e2e 테스트 스크립트
- **Setup:** `pnpm test:e2e:slack`
- **Env vars:** `SLACK_TEST_USER_TOKEN`, `SLACK_TEST_CHANNEL_ID` (값은 .env)
- **Verification:** 리액션 흐름(👀→✅→🖼️), 스레드 요약 메시지, 카드뉴스 이미지 메시지, 실패 시 ❌+사유
- **Coder task:** "Slack Bot e2e 테스트 스크립트 작성"

## Demo Scenario
Slack #general 채널에 팀원이 기술 블로그 링크 1개를 포함한 메시지를 보낸다. 봇이 👀 리액션을 달고, 잠시 후 스레드에 불릿 3줄 요약이 올라오며 ✅로 바뀐다. 이어서 카드뉴스 3장 이미지가 스레드에 추가되고 🖼️ 리액션이 붙는다. 웹앱을 열면 해당 메시지가 피드 최상단에 보이고, 태그로 필터링할 수 있다. 공유 버튼을 누르면 공개 URL이 생성되고, 그 URL을 브라우저에서 열면 요약과 카드뉴스가 보이며 CTA로 랜딩페이지로 이동할 수 있다.
