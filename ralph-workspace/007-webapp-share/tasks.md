# Tasks: 웹앱 메시지 공유

## Task 1: 공유 링크 생성 API
**Description:** 메시지의 share_token을 사용하여 공개 공유 URL을 생성하는 API를 구현한다. share_token이 없는 메시지는 최초 공유 시 고유 토큰을 생성한다.
**Acceptance Criteria:**
- 메시지 ID로 공유 URL을 요청하면 고유 share_token 기반 URL을 반환한다
- 이미 share_token이 있으면 재사용한다
- 인증된 사용자만 공유 링크를 생성할 수 있다
**TDD Approach:** share_token 생성 및 URL 반환 테스트
**Validation:** API 호출로 공유 URL 생성 확인

## Task 2: 공유 페이지 및 OG 메타태그
**Description:** share_token으로 접근하는 공개 공유 페이지를 구현한다. SSR로 OG 메타태그를 설정하고, 태그/캐러셀/요약/CTA를 표시한다. 인증 불필요.
**Acceptance Criteria:**
- 공유 URL로 로그인 없이 접근할 수 있다
- 태그, 카드뉴스 캐러셀, 3줄 요약, CTA 버튼이 표시된다
- 공유자/날짜는 표시되지 않는다
- CTA 클릭 시 랜딩페이지로 이동한다
- OG 메타태그에 3줄 요약 텍스트 + 카드뉴스 1번 이미지가 포함된다
- 유효하지 않은 share_token 시 에러 메시지 표시
**TDD Approach:** OG 메타태그 출력 테스트, 잘못된 토큰 처리 테스트
**Validation:** gstack으로 공유 페이지 렌더링 및 OG 태그 확인
