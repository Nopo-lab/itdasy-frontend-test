# T-433 · Sprint B 이모지 창고

**상태:** coding complete  
**위험도:** 🟡 스테이징 기능 추가  
**범위:** `itdasy_backend` + `itdasy-frontend-test-yeunjun`

## 목표

forcodex.md 의 Sprint B 를 Sprint C 다음 순서로 반영한다.

- 계정별 캡션/DM 이모지 슬롯 저장
- 캡션 입력과 DM 초안 입력 근처에서 빠르게 삽입
- 서버 값을 기준으로 여러 기기에서 같은 이모지 보이게 처리

## 적용 방식

- 백엔드 `GET/PATCH /persona/emojis` 추가
- 기존 `Persona.emojis`, `Persona.dm_emojis` 컬럼 재사용
- 프론트에 `app-emoji-storage.js` 신규 추가
- 캡션/DM 입력창 옆에 빠른 이모지 줄 추가
- script 추가가 있어 `risk:integration` 로 보고하고 smoke 로 확인

## 검증

- Python 문법 확인
- 변경 프론트 파일 `node --check`
- 프론트 smoke/test
- 변경 파일 중심 자동 검사
- 프론트/백엔드 `git diff --check`
