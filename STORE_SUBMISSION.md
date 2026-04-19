# 📱 스토어 제출 통합 가이드 (Play + App Store + Meta BV)

> 승인 나오면 **이 문서 한 장만** 보고 제출. 2026-04-19 기준.

---

## 🔑 사업자·계정 정보

| 항목 | 값 |
|---|---|
| 사업자명 | 와이투두 (Y2do) |
| 대표자 | 강연준 |
| 사업자등록번호 | 179-36-01681 |
| 사업장 소재지 | 경기도 화성시 효행로 1068, 6F 603-J257 (병점동, 리더스프라자) |
| 우편번호 | 18405 |
| 주업종 | 응용 소프트웨어 개발 및 공급업 (620101) |
| Meta Business Portfolio ID | 924077833787792 |
| Meta 앱 ID | 1460854595835736 |
| Meta 로그인 이메일 | l2doworks@gmail.com |
| Apple ID (Developer) | l2doworks@gmail.com *(확인 필요)* |
| Google Play Console | 승인 대기 |
| 홍보 웹사이트 | https://nopo-lab.github.io/itdasy-promo/ |
| 개인정보처리방침 | https://nopo-lab.github.io/itdasy-promo/privacy.html |
| 이용약관 | https://nopo-lab.github.io/itdasy-frontend-test-yeunjun/terms.html |

---

## 🎯 앱 공통 정보

| 항목 | 값 |
|---|---|
| 앱 이름 (한국어) | 잇데이 스튜디오 |
| 앱 이름 (영어) | Itdasy Studio |
| 패키지명 (Android) | `com.nopolab.itdasy` |
| 번들 ID (iOS) | `com.nopolab.itdasy` |
| 카테고리 | Business / 비즈니스 |
| 연령 등급 | 전체 이용가 (17+ 비즈니스, 결제 있음) |
| 가격 | 무료 (인앱결제 있음) |

---

## 🤖 Google Play Console

### 앱 등록 순서
1. **Play Console 로그인** → "앱 만들기"
2. 앱 이름: `잇데이 스튜디오`
3. 기본 언어: 한국어
4. 무료/유료: 무료
5. 선언 체크박스 모두 동의

### 짧은 설명 (80자 이내)
```
뷰티샵 원장님을 위한 AI 인스타 자동화. 말투 분석으로 내 글처럼 캡션을 써드리고, 사진 누끼·합성까지 한 번에.
```

### 긴 설명 (4000자 이내)
```
잇데이 스튜디오 — 뷰티샵 원장님의 인스타 자동화 파트너

✨ 핵심 기능
• AI 말투 학습: 과거 인스타 글 30개를 분석해 원장님 특유의 말투·이모지·해시태그를 학습합니다.
• 맞춤형 캡션 생성: 학습된 말투로 새 게시물 글을 자동 작성. 마음에 안 들면 "짧게/길게/친근하게" 한 번의 탭으로 재생성.
• 사진 편집: 시술 Before/After 합성, AI 누끼 제거, 배경 자동 합성.
• 예약 발행: 원하는 시간에 맞춰 인스타그램에 자동 업로드.
• 릴스 스크립트: 영상 자막도 AI가 10자 이내로 짜드립니다.

🎀 이런 원장님께 추천
• 매일 피드 글 쓰는 게 고역인 분
• 손님 시술 끝내고 나면 에너지가 없는 분
• 인스타 마케팅 외주 맡기기엔 부담스러운 분

💰 요금제
• Free: 하루 캡션 3회, 누끼 2회 — 맛보기
• Pro ₩19,900/월: 캡션 무제한, 누끼 하루 20회, 예약 발행, 스토리 템플릿
• Premium ₩39,900/월: Pro 전체 + 누끼 무제한 + DM 자동응답 + AI 비전 견적

🔒 개인정보 보호
모든 데이터는 암호화 저장되며, 회원 탈퇴 시 즉시 파기됩니다. 제3자에게 판매하지 않습니다.
```

### Data Safety 양식 답변

| 데이터 유형 | 수집 | 처리 방식 |
|---|---|---|
| 이메일 주소 | O | 회원 식별, 암호화 전송, 삭제 요청 가능 |
| 이름 | O | 앱 기능 제공, 암호화 전송 |
| 비밀번호 | O | bcrypt 해시 저장, 원문 보관 안 함 |
| IP 주소 | O | 보안·부정 사용 방지, 90일 보관 |
| 사용자 생성 사진·동영상 | O | 앱 기능(AI 분석·캡션 생성), Supabase Storage 암호화, 사용자 삭제 가능 |
| 사용자 생성 콘텐츠(캡션) | O | 앱 기능 제공 |
| 구매 내역 | O | 결제 처리, 전자상거래법 5년 보관 |
| 앱 상호작용(탭·스크롤) | X | 수집 안 함 |
| 광고 식별자 | X | 수집 안 함 |
| 제3자 공유 | O | Google Gemini(AI), Replicate(이미지), Meta(인스타), Resend(이메일), Supabase(인프라) |
| 데이터 암호화 전송 | O | HTTPS 강제, HSTS |
| 사용자 데이터 삭제 요청 | O | 앱 내 "회원 탈퇴" 즉시 삭제 |

### IAP 제품 등록 (Play Console → 수익 창출 → 제품 → 구독)
```
제품 ID              가격         이름              설명
─────────────────────────────────────────────────────────────────
itdasy_pro_monthly_19900       ₩19,900/월   Pro 월간          캡션 무제한 + 누끼 일 20회 + 예약 발행
itdasy_premium_monthly_39900   ₩39,900/월   Premium 월간      Pro + 누끼 무제한 + DM 자동응답
```

### 스크린샷 (6~10장 필요)
- 6.7" (최소): 1284×2778 (iPhone 14 Pro Max 비율 / Android 16:9)
- 실기기 촬영 권장 화면:
  - 홈 (인스타 연동된 상태)
  - 캡션 생성 중
  - 인스타 프레임 미리보기
  - 누끼 편집
  - 예약 발행 설정
  - 페르소나 분석 결과

### 업로드할 AAB
- 위치: `/Users/kang-yeonjun/Downloads/itdasy-apk/app-release.aab` (서명됨, 4.8MB)
- 또는 GitHub Actions > "Android Build" > release 빌드 실행 후 다운로드

---

## 🍎 App Store Connect

### 앱 등록 순서
1. **App Store Connect 로그인** → My Apps → `+` → New App
2. Platform: iOS
3. Name: `잇데이 스튜디오`
4. Primary Language: Korean
5. Bundle ID: `com.nopolab.itdasy` (등록 필요)
6. SKU: `itdasy-studio-kr`

### App Information
| 필드 | 값 |
|---|---|
| Subtitle (30자) | AI 인스타 자동화 마케팅 |
| Category Primary | Business |
| Category Secondary | Lifestyle |
| Content Rights | Does NOT contain third-party content |

### Privacy Policy URL
```
https://nopo-lab.github.io/itdasy-promo/privacy.html
```

### Description (Promotional Text)
짧은 설명 (170자):
```
뷰티샵 원장님을 위한 AI 인스타 자동화 도우미. 내 말투 그대로 캡션을 써주고, 사진 누끼·예약 발행까지 한 번에.
```

Full Description: Play 긴 설명 그대로 복붙.

### Keywords (100자)
```
뷰티샵,인스타,AI,캡션,마케팅,자동화,누끼,예약발행,원장님,소상공인
```

### IAP 제품 (App Store Connect → Monetization → Subscriptions)
Product ID 를 **Play 와 동일**하게 맞춤 (통일된 백엔드 처리):
```
itdasy_pro_monthly_19900        Auto-Renewable Subscription  $14.99 Tier (≈₩19,900)
itdasy_premium_monthly_39900    Auto-Renewable Subscription  $29.99 Tier (≈₩39,900)
```
Subscription Group: `itdasy_subscriptions`

### App Review Information
```
Contact: 강연준
Email: l2doworks@gmail.com
Phone: +82 10-xxxx-xxxx
Review notes (연결법 안내):
  Demo account: demo@itdasy.com / demo1234
  (Instagram Business 계정 준비한 테스트 계정 제공 필요)
```

---

## 📘 Meta Business Verification

### 비즈니스 포트폴리오 정보 입력
| Meta 필드 | 값 |
|---|---|
| Legal business name | `와이투두` (사업자등록증 상호 그대로) |
| Street address | `1068, Hyohaeng-ro, 6F Room 603-J257` |
| City | `Hwaseong-si` |
| State/Province | `Gyeonggi-do` |
| Zip/Postal code | `18405` |
| Country | `South Korea` |
| Business phone | `+82 10-xxxx-xxxx` |
| Website | `https://nopo-lab.github.io/itdasy-promo/` |
| Tax ID | `179-36-01681` |
| Business type | `Sole proprietorship` |

### 필요 서류
1. **영문 사업자등록증** (홈택스 발급) — 제출처: `Meta Platforms, Inc.`
2. **대표자 본인인증**: 여권 스캔 **또는** 주민등록증 앞면 (뒷자리 가리지 말 것)

### 전화번호 인증 문제 우회
- 한국 사업자등록증은 전화번호 없음
- 해결: `통신판매업신고증` 발급 (gov.kr 무료) → 대표전화 기재 → Meta 에 업로드

### 심사 상태 확인
```
https://business.facebook.com/settings/security?business_id=924077833787792
```
- 현재: **심사중** (2026-04-19 제출)
- 예상 소요: 2일 ~ 3주

---

## 🚀 출시 순서 (승인·허가 나오는 대로)

### Phase 1: Android Internal Testing (Play 승인 후 즉시)
```
1. Play Console 앱 등록 + 메타데이터 입력
2. Internal Testing 트랙 생성
3. AAB 업로드 (Actions 에서 release 빌드 → 다운로드)
4. 테스터 이메일: kangtaetv@gmail.com, l2doworks@gmail.com, 원영
5. 설치 링크 테스터에게 전달
```

### Phase 2: iOS TestFlight (Apple 승인 후)
```
1. Xcode 설치 (Mac App Store)
2. 프로젝트 루트에서: npx cap add ios
3. GoogleService-Info.plist 를 ios/App/App/ 에 배치
4. Info.plist 에 NSCameraUsageDescription 등 권한 문구 추가
5. Xcode 에서 Archive → App Store Connect 업로드
6. TestFlight 에서 내부 테스터 초대
```

### Phase 3: Closed Testing (Meta BV 완료 후)
```
Play: Closed Testing 트랙 (최대 50명)
Apple: TestFlight External (최대 10000명, App Review 1회 필요)
```

### Phase 4: Production (모든 승인 완료)
```
Play: Production 트랙 → Percentage rollout (1% → 10% → 100%)
Apple: App Store Submission → App Review (1~3일)
```

---

## 📋 승인 나오면 바로 할 To-do (체크리스트)

### Apple 승인 직후
- [ ] `appleid.apple.com` 로그인 확인
- [ ] Developer agreement 동의
- [ ] Bundle ID 등록: `com.nopolab.itdasy`
- [ ] Xcode 설치 → `npx cap add ios`
- [ ] GoogleService-Info.plist 저한테 (Claude) 요청
- [ ] Info.plist 권한 문구 — 제가 템플릿 이미 준비

### Play Console 승인 직후  
- [ ] 앱 생성 → 위 메타데이터 복붙
- [ ] Data Safety 양식 (위 표 그대로)
- [ ] AAB 업로드 (`app-release.aab`)
- [ ] Internal Testing 트랙 → 테스터 등록 → 링크 받기

### Meta BV 승인 직후
- [ ] 앱 리뷰 신청 (instagram_business_content_publish 등 scope 공개)
- [ ] Live 모드 전환
- [ ] Webhooks 등록 (data deletion callback — 이미 구현됨)

---

_최종 갱신: 2026-04-19 / Claude 정리_
