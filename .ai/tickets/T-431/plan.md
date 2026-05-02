# T-431 · Sprint D 포트폴리오 자동 태그

**상태:** coding complete  
**위험도:** 🟡 스테이징 기능 추가  
**범위:** `itdasy_backend` + `itdasy-frontend-test-yeunjun`

## 목표

forcodex.md 의 Sprint D 를 Sprint E 다음 순서로 반영한다.

- 포트폴리오 사진 업로드 시 태그가 비어 있으면 자동으로 태그 붙이기
- 업종별로 다른 태그 기준 사용
- 포트폴리오 사진을 눌러 태그를 칩으로 수정 가능하게 만들기
- 자동 태그 사용량을 하루 한도로 기록하기

## 적용 방식

- 백엔드에 `services/portfolio_tagger.py` 추가
- `POST /portfolio` 에 자동 태그 연결
- `GET /portfolio/tags`, `PATCH /portfolio/{id}`, `POST /portfolio/reorder` 보강
- 프론트에 `app-portfolio-tags.js` 추가
- 기존 포트폴리오 카드 클릭 시 새 태그 편집창을 열도록 연결
- script 추가가 있어 `risk:integration` 로 보고하고 smoke 로 확인

## 검증

- Python 문법 확인
- 변경 프론트 파일 `node --check`
- 프론트 smoke/test
- 변경 파일 중심 자동 검사
- 프론트/백엔드 `git diff --check`
