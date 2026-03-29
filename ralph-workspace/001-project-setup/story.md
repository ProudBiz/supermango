# 프로젝트 초기 설정

## Description
개발자가 모노레포 환경에서 웹앱과 Slack Bot을 독립적으로 개발하고 배포할 수 있도록, Turborepo 기반 프로젝트 구조와 Supabase DB 스키마를 설정한다.

## Acceptance Criteria
- Turborepo 모노레포 구조 (`apps/web`, `apps/slack-bot`, `packages/shared`)가 동작한다
- Next.js 웹앱이 `pnpm dev --filter web`으로 로컬에서 실행된다
- Slack Bot이 `pnpm dev --filter slack-bot`으로 로컬에서 Socket Mode 연결된다
- Supabase에 필요한 테이블이 생성되어 있다
- shared 패키지에서 Supabase 클라이언트와 타입을 export하고 양쪽 앱에서 import할 수 있다
