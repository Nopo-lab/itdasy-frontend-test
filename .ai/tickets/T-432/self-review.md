# T-432 · self-review

1. 변경 파일 전체 목록
   - 프론트: `app-photo-enhance.js`, `app-gallery-slot-editor.js`, `app-core.js`, `index.html`, `sw.js`
2. `index.html` 스크립트 로드 순서 영향
   - `app-gallery-bg.js` 뒤에 `app-photo-enhance.js` 추가. `risk:integration` 대상이라 smoke 로 확인함.
3. `window.*` 전역 추가/제거
   - HTML onclick 에서 쓰는 전역 함수 `openEnhancePanel`, `closeEnhancePanel`, `applyEnhanceToSelected` 추가.
4. localStorage 키 관련
   - 읽기만 기존 `shop_type` 사용. 토큰/localStorage 신규 키 없음.
5. Capacitor 브릿지 관련
   - 변경 없음.
6. Supabase 권한 의존 쿼리
   - 없음.
7. 50줄 초과 함수를 새로 만들지 않음
   - 새 보정 로직은 작은 함수로 분리.
8. 빈 catch 추가하지 않음
   - 신규 빈 catch 없음.
9. 커밋 메시지 티켓 번호
   - 커밋 시 `T-432` 포함 필요.
10. 로컬 확인
   - `node --check ...` 통과
   - `npm run smoke` 통과
   - `npm test` 통과
   - 변경 파일 중심 자동 검사 오류 0개, 경고만 있음
   - `git diff --check` 통과
   - 전체 자동 검사는 기존 오래된 빈 블록 오류 15개 때문에 실패
