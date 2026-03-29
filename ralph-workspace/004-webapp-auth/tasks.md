# Tasks: 웹앱 Slack OAuth 로그인

## Task 1: Supabase Auth + Slack OAuth 연동
**Description:** Next.js App Router에서 Supabase Auth를 설정하고, Slack OAuth(OIDC)로 로그인/로그아웃 기능을 구현한다. 인증 상태에 따라 피드 또는 랜딩페이지로 라우팅한다.
**Acceptance Criteria:**
- "Slack으로 로그인" 버튼 클릭 시 Slack OAuth 플로우가 시작된다
- 로그인 성공 후 피드 페이지로 리다이렉트된다
- 비로그인 사용자는 랜딩페이지로 리다이렉트된다
- 로그아웃 버튼이 동작한다
- 사용자 워크스페이스 정보가 DB에 저장된다
**TDD Approach:** 인증 미들웨어 라우팅 테스트, 콜백 처리 테스트
**Validation:** gstack으로 Slack OAuth 로그인 플로우 전체 확인
