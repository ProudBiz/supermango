# Tasks: 프로젝트 초기 설정

## Task 1: Turborepo 모노레포 초기화
**Description:** Turborepo 모노레포를 설정한다. `apps/web` (Next.js), `apps/slack-bot` (Node.js), `packages/shared` 구조를 만들고, 루트 `turbo.json`과 각 패키지의 `package.json`을 구성한다.
**Acceptance Criteria:**
- `pnpm install`이 루트에서 모든 의존성을 설치한다
- `pnpm dev`가 web과 slack-bot을 동시에 실행한다
- `pnpm dev --filter web`과 `pnpm dev --filter slack-bot`이 개별 실행된다
**TDD Approach:** 빌드 스크립트가 에러 없이 실행되는지 확인
**Validation:** `pnpm dev --filter web`으로 Next.js가 localhost에서 뜨는지 확인

## Task 2: Supabase DB 스키마 설정
**Description:** Supabase에 데이터 모델에 맞는 테이블을 생성한다. workspaces, channels, messages, urls, tags 테이블과 관계를 정의한다. messages 테이블에는 summary, card_images, status, share_token 컬럼을 포함한다.
**Acceptance Criteria:**
- 모든 테이블이 Supabase에 생성된다
- 외래 키 관계가 올바르게 설정된다
- RLS(Row Level Security) 정책: 사용자는 자신이 속한 워크스페이스의 메시지만 조회 가능, 공유 페이지용 share_token 기반 공개 접근 허용
**TDD Approach:** 마이그레이션 스크립트가 에러 없이 실행되는지 확인
**Validation:** Supabase 대시보드에서 테이블 구조 확인

## Task 3: Shared 패키지 설정
**Description:** `packages/shared`에 Supabase 클라이언트 초기화, TypeScript 타입 정의, 공통 유틸리티를 설정한다. 환경 변수에서 Supabase 설정을 읽고, 양쪽 앱에서 import할 수 있도록 export한다.
**Acceptance Criteria:**
- `@linkdigest/shared`로 import 가능
- Supabase 클라이언트가 정상 초기화된다
- DB 테이블에 대응하는 TypeScript 타입이 정의된다
**TDD Approach:** Supabase 클라이언트 연결 테스트, 타입 체크
**Validation:** web과 slack-bot 모두에서 shared 패키지를 import하여 Supabase에 쿼리 실행
