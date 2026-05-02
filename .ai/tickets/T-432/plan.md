# T-432 · Sprint C 사진 보정

**상태:** coding complete  
**위험도:** 🟡 스테이징 기능 추가  
**범위:** `itdasy-frontend-test-yeunjun`

## 목표

forcodex.md 의 Sprint C 를 Sprint D 다음 순서로 반영한다.

- 작업실 사진 편집에 보정 도구 추가
- 업종별로 보이는 보정 항목 다르게 처리
- 선택한 사진에 잔머리 정리, 색 균일화, 결 부드럽게, 충혈 제거를 1차 적용

## 적용 방식

- `app-photo-enhance.js` 신규 추가
- 슬롯 편집 하단 도구에 `보정` 버튼 추가
- 보정 패널을 `index.html` 에 추가
- 보정된 사진은 기존 슬롯 저장 흐름으로 저장
- script 추가가 있어 `risk:integration` 로 보고하고 smoke 로 확인

## 검증

- 변경 프론트 파일 `node --check`
- 프론트 smoke/test
- 변경 파일 중심 자동 검사
- 프론트 `git diff --check`
