# T-431 · self-review

1. 변경 파일 전체 목록
   - 프론트: `app-portfolio.js`, `app-portfolio-tags.js`, `app-gallery-finish.js`, `app-core.js`, `index.html`, `sw.js`
   - 백엔드: `backend/routers/portfolio.py`, `backend/services/portfolio_tagger.py`, `backend/utils/plan_limits.py`, `backend/routers/subscription.py`
2. `index.html` 스크립트 로드 순서 영향
   - `app-portfolio.js` 바로 뒤에 `app-portfolio-tags.js` 추가. `risk:integration` 대상이라 smoke 로 확인함.
3. `window.*` 전역 추가/제거
   - 신규 전역 없음. 포트폴리오 파일끼리는 브라우저 이벤트로 연결.
4. localStorage 키 관련
   - 신규 토큰/localStorage 키 없음.
5. Capacitor 브릿지 관련
   - 변경 없음.
6. Supabase 권한 의존 쿼리
   - 신규/수정 라우트 모두 현재 로그인 사용자 `user_id` 로 제한.
7. 50줄 초과 함수를 새로 만들지 않음
   - 새 태그 편집 파일은 작은 함수로 분리. 기존 긴 포트폴리오 함수에는 연결 코드만 추가.
8. 빈 catch 추가하지 않음
   - 신규 빈 catch 없음.
9. 커밋 메시지 티켓 번호
   - 커밋 시 `T-431` 포함 필요.
10. 로컬 확인
   - `python3 -m py_compile ...` 통과
   - `node --check ...` 통과
   - `npm run smoke` 통과
   - `npm test` 통과
   - 변경 파일 중심 자동 검사 오류 0개, 경고만 있음
   - `git diff --check` 프론트/백엔드 통과
   - 전체 자동 검사는 기존 오래된 빈 블록 오류 15개 때문에 실패
   - 백엔드 pytest는 로컬에 pytest가 없어 실행 불가
