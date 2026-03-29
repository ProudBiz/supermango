# Tasks: 카드뉴스 이미지 생성

## Task 1: 카드뉴스 이미지 생성 서비스
**Description:** 3줄 요약 텍스트를 입력받아 3장의 카드뉴스 이미지(PNG)를 생성하는 서비스를 구현한다. 각 장에 요약 1줄씩 배치한다. 디자인 톤은 딥 네이비 다크 배경 + 대담한 타이포그래피.
**Acceptance Criteria:**
- 3줄 요약을 입력받아 3장의 PNG 이미지를 생성한다
- 각 이미지에 요약 1줄이 가독성 좋게 배치된다
- 디자인 톤이 spec의 비주얼 톤과 일치한다
**TDD Approach:** 이미지 생성 함수가 3개의 이미지 Buffer를 반환하는지 테스트
**Validation:** 생성된 이미지를 시각적으로 확인

## Task 2: 카드뉴스 업로드 및 Slack 게시
**Description:** 생성된 카드뉴스 이미지를 Supabase Storage에 업로드하고, Slack 스레드에 이미지 메시지로 게시한다. 🖼️ 리액션을 추가하고 DB 상태를 업데이트한다.
**Acceptance Criteria:**
- 이미지가 Supabase Storage `card-images` 버킷에 업로드된다
- 공개 URL이 생성된다
- Slack 스레드에 이미지가 게시된다
- 🖼️ 리액션이 추가된다
- DB의 message 상태가 complete로 업데이트되고 이미지 URL이 저장된다
**TDD Approach:** Storage 업로드 및 URL 생성 테스트, Slack 메시지 전송 테스트
**Validation:** Slack에서 카드뉴스 이미지가 스레드에 표시되는지 확인
