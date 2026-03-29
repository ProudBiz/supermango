# Tasks: Slack 링크 자동 요약

## Task 1: Slack Bot 기본 설정 및 링크 감지
**Description:** Bolt for JavaScript로 Socket Mode 연결을 설정하고, public 채널(`message.channels`) 및 private 채널(`message.groups`) 메시지에서 URL이 포함된 메시지를 감지하는 이벤트 리스너를 구현한다. 링크 감지 시 👀 리액션을 추가한다. DM은 무시한다.
**Acceptance Criteria:**
- Socket Mode로 Slack에 정상 연결된다
- URL이 포함된 채널 메시지를 감지한다
- 감지 시 원본 메시지에 👀 리액션을 추가한다
- DM 메시지는 무시한다
**TDD Approach:** 메시지 이벤트에서 URL 추출 로직 단위 테스트, 리액션 추가 동작 테스트
**Validation:** Slack 테스트 채널에 링크를 보내고 👀 리액션이 달리는지 확인

## Task 2: Jina Reader 콘텐츠 추출
**Description:** Jina Reader API를 사용하여 URL에서 마크다운 콘텐츠를 추출하는 서비스를 구현한다. 여러 URL을 처리하되 최대 5개로 제한한다. 실패 시 에러 정보를 반환한다.
**Acceptance Criteria:**
- URL을 Jina Reader API로 보내 마크다운 콘텐츠를 받아온다
- 최대 5개 URL만 처리한다
- 타임아웃, 404, 페이월 등 실패 케이스를 처리한다
**TDD Approach:** Jina Reader 호출 및 응답 파싱 테스트, 에러 케이스 테스트
**Validation:** 다양한 URL (블로그, 뉴스, GitHub 등)에 대해 콘텐츠 추출 확인

## Task 3: Gemini 요약 및 태그 생성
**Description:** Gemini API를 사용하여 추출된 콘텐츠를 3줄 요약하고 태그를 자동 생성하는 서비스를 구현한다. 여러 URL의 콘텐츠를 합산하여 하나의 요약으로 만든다.
**Acceptance Criteria:**
- 마크다운 콘텐츠를 입력받아 불릿 3줄 요약을 생성한다
- 내용에 맞는 태그를 자동 생성한다
- 여러 URL의 콘텐츠를 합산하여 하나의 요약으로 만든다
- API 실패 시 에러를 반환한다
**TDD Approach:** 프롬프트 결과 형식 검증, 에러 핸들링 테스트
**Validation:** 다양한 콘텐츠에 대해 요약 품질 확인

## Task 4: 요약 파이프라인 통합 및 스레드 응답
**Description:** 링크 감지 → Jina Reader → Gemini → 스레드 응답 → DB 저장 파이프라인을 통합한다. 리액션 흐름(👀→✅)을 구현하고, 실패 시 ❌ 리액션과 사유 안내를 처리한다. 5개 초과 URL 안내를 포함한다.
**Acceptance Criteria:**
- 전체 파이프라인이 순차적으로 동작한다
- 스레드에 불릿 3줄 요약이 게시된다
- 요약 완료 시 👀 제거, ✅ 추가
- 실패 시 ❌ 리액션 + 실패 사유 스레드 안내
- 5개 초과 URL 시 안내 메시지 포함
- 결과가 Supabase DB에 저장된다
**TDD Approach:** 파이프라인 전체 흐름 통합 테스트, 실패 시나리오 테스트
**Validation:** Slack에서 다양한 링크 조합으로 전체 흐름 확인
