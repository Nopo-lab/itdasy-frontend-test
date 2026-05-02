# T-430 · self-review

1. 변경 파일 전체 목록
   - 프론트: `app-service-templates.js`, `app-inventory-hub.js`, `app-inventory.js`, `app-today-brief.js`, `app-dm-autoreply.js`, `app-core.js`, `index.html`, `sw.js`
   - 백엔드: `backend/models.py`, `backend/main.py`, `backend/routers/bookings.py`, `backend/routers/services.py`, `backend/routers/inventory.py`, `backend/routers/today.py`, `backend/routers/retouch.py`, `backend/routers/dm_autoreply.py`, `backend/routers/dm_confirm_queue.py`, `backend/schemas/booking.py`, `backend/schemas/inventory.py`, `backend/schemas/services.py`, `backend/services/sprint_e.py`, `backend/services/retouch_reminder.py`, `backend/services/dm_intent.py`, `backend/alembic/versions/0010_sprint_e_retouch_inventory.py`
2. `index.html` 스크립트 로드 순서 영향 없음 확인
   - script 순서 변경 없음. 빌드 이름만 갱신.
3. `window.*` 전역 추가/제거
   - 신규 전역 없음.
4. localStorage 키 관련
   - 신규 토큰/localStorage 키 없음.
5. Capacitor 브릿지 관련
   - 변경 없음.
6. Supabase 권한 의존 쿼리
   - user_id 필터 유지. 신규 라우트도 현재 로그인 사용자 기준.
7. 50줄 초과 함수를 새로 만들지 않음
   - 백엔드 신규 함수는 작게 분리. 프론트 기존 긴 함수에 일부 연결 추가가 있어 자동 검사 경고는 남음.
8. 빈 catch 추가하지 않음
   - 신규 빈 catch 없음.
9. 커밋 메시지 티켓 번호
   - 커밋 시 `T-430` 포함 필요.
10. 로컬 확인
   - `python3 -m py_compile ...` 통과
   - `node --check ...` 통과
   - `npm run smoke` 통과
   - `npm test` 통과
   - 변경 파일 중심 자동 검사 오류 0개, 경고만 있음
   - 전체 자동 검사는 기존 오래된 빈 블록 오류 15개 때문에 실패
   - 백엔드 pytest는 로컬에 pytest가 없어 실행 불가
