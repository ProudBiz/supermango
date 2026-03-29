# 카드뉴스 이미지 생성

## Description
요약이 완료된 후, 3줄 요약을 기반으로 3장의 카드뉴스 이미지를 생성하여 Slack 스레드에 게시하고 Supabase Storage에 저장한다.

## Acceptance Criteria
- 요약 완료 후 비동기로 카드뉴스 이미지 3장을 생성한다
- 생성된 이미지를 Supabase Storage `card-images` 버킷에 업로드한다
- 카드뉴스 이미지를 Slack 스레드에 별도 메시지로 게시한다
- 카드뉴스 완료 시 원본 메시지에 🖼️ 리액션을 추가한다
- DB의 message 상태를 complete로 업데이트하고 이미지 URL을 저장한다
- 카드뉴스 생성 실패 시에도 요약은 유지된다 (요약 상태는 ✅ 유지)
