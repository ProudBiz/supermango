# Tasks: Slack Bot e2e 테스트 스크립트

## Task 1: Slack e2e 테스트 스크립트 작성
**Description:** Slack Web API를 사용하여 테스트 채널에 메시지를 보내고, 봇의 리액션과 스레드 응답을 polling으로 확인하는 e2e 테스트 스크립트를 작성한다. 성공 케이스와 실패 케이스를 모두 테스트한다.
**Acceptance Criteria:**
- `pnpm test:e2e:slack`으로 실행 가능하다
- 테스트 채널에 유효한 링크 메시지를 보내고 👀→✅→🖼️ 리액션 흐름을 확인한다
- 스레드에 요약 메시지와 카드뉴스 이미지가 있는지 확인한다
- 잘못된 URL로 ❌ 리액션과 실패 사유를 확인한다
- 테스트 후 전송한 메시지를 정리(삭제)한다
- 타임아웃을 설정하여 무한 대기를 방지한다 (요약 대기 60초, 카드뉴스 대기 120초)
**TDD Approach:** 테스트 유틸리티(polling, assertion) 단위 테스트
**Validation:** 실제 Slack 환경에서 테스트 스크립트 실행 확인
