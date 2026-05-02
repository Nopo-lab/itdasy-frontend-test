# T-433 · self-review

1. 변경 파일 전체 목록
   - 프론트: `app-emoji-storage.js`, `app-core.js`, `index.html`, `sw.js`
   - 백엔드: `backend/routers/persona.py`
2. `index.html` 스크립트 로드 순서 영향
   - 하단 앱 스크립트 영역에 `app-emoji-storage.js` 추가. `risk:integration` 대상이라 smoke 로 확인함.
3. `window.*` 전역 추가/제거
   - 신규 전역 없음.
4. localStorage 키 관련
   - 신규 저장 키 없음. 이모지 원본은 서버 `Persona` 컬럼.
5. Capacitor 브릿지 관련
   - 변경 없음.
6. Supabase 권한 의존 쿼리
   - 현재 로그인 사용자 `user_id` 기준으로만 읽고 저장.
7. 50줄 초과 함수를 새로 만들지 않음
   - 작은 함수로 분리.
8. 빈 catch 추가하지 않음
   - 신규 빈 catch 없음.
9. 커밋 메시지 티켓 번호
   - 커밋 시 `T-433` 포함 필요.
10. 로컬 확인
   - `python3 -m py_compile backend/routers/persona.py` 통과
   - `node --check ...` 통과
   - `npm run smoke` 통과
   - `npm test` 통과
   - 변경 파일 중심 자동 검사 오류 0개, 경고만 있음
   - `git diff --check` 프론트/백엔드 통과
   - 백엔드 pytest는 로컬에 pytest가 없어 실행 불가
