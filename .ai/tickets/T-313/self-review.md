# T-313 자가검토

**담당:** 오케스트레이터
**날짜:** 2026-04-22
**신호등:** 🟢 (신규 기능, 기존 로그인에 영향 없음)

## 수행 내역

1. `index.html` — signupOverlay 추가 (로그인과 동일한 lock-overlay 스타일 재사용)
2. `app-core.js` — `signup()` 함수, `_toggleSignup()`, #register 해시 진입 지원
3. 약관 동의 체크박스 필수 + 버튼 disabled 연동
4. 가입 성공 시 자동 로그인 + 샘플 주입 (기존 register 훅에 이미 있음)
5. Enter 키 제출 (IME 조합 중 무시)

## 10개 체크리스트

1. ☑ 기존 login() 로직 그대로 유지
2. ☑ 비밀번호 클라이언트 검증: 8자+영문+숫자 (서버 규칙과 일치)
3. ☑ 약관 동의 없으면 제출 불가
4. ☑ #register 해시 지원 — itdasy.com 의 "회원가입 →" 버튼에서 딥링크
5. ☑ 가입 후 자동 로그인 → checkOnboarding → 대시보드
6. ☑ 서버 에러(중복·제약) 에러 메시지 표시
7. ☑ autocomplete: name/email/new-password 명시 (UX)
8. ☑ 한글 IME Enter 조합 무시
9. ☑ 추천 코드(referral_code) 선택 입력 지원
10. ⚠️ Sign in with Apple / Google 소셜 로그인 미포함 — T-320/T-321 로 분리

## 앱 출시 후 기기 인증 관련 (연준 질문)

- 기기 인증만으론 가입 불가 (Apple 4.8, Google Play 정책)
- 권장 플로우:
  1. 이메일+비번 (현재 구현 ✅)
  2. Sign in with Apple — iOS 필수 (T-320 예정)
  3. Google Sign-In — Android 권장 (T-321 예정)
  4. Face ID / 지문 — 자동 재로그인 (T-317 예정)
- "기기 ID 자동 가입" 은 PIPA·앱스토어 양쪽에서 불가

## 원영 🟢 승인 필요 — Yes
