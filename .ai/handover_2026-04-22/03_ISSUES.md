# 03 알려진 이슈 — 백로그 티켓 요약

> 디자인 세션 백로그 (`백로그.md`) 중 **연준님이 알아둘 필요 있는 것만** 추려둠.
> 전체 티켓은 디자인 세션 담당.
> 상태: Open = 처리 대기, Pending = Phase 미배정, Done = 완료, Cancelled = 폐기

---

## 연준님이 직접 관여 가능성 있는 것

### T-407 · Open · 터미널 운영 규칙 — 레포/디렉토리 정합성 필수
- **증상**: 2026-04-22 G3 머지 시점에 Sonnet-B 가 **구버전 레포** `itdasy-studio` 에서 작업 → 결과물 유실 위험
- **현황 파악**:
  - 현재 정식 레포: `Nopo-lab/itdasy-frontend-test-yeunjun`
  - 구버전 레포: `Nopo-lab/itdasy-studio` (deprecated, T-408 로 정리 대기)
- **재발 방지 규칙**:
  - 세션 시작 시 모든 터미널에서 `pwd && git remote -v` 확인
  - 프롬프트 헤더에 타겟 레포 명시: `📤 대상: Sonnet-B @ itdasy-frontend-test-yeunjun`
  - 같은 clone 으로 통일 권장
- **연준님 참조**: 혹시 연준님이 구버전 레포 링크를 통해 뭔가 받으시면 **원영/오케스트레이터에게 확인** 바람. 정식 레포 확정 필요.

### T-408 · Pending · `itdasy-studio` 구버전 레포 정리
- **현황**: `Nopo-lab/itdasy-studio` 가 구버전으로 확정
- **처리 옵션**:
  - (a) GitHub archive 처리 (추천)
  - (b) README 에 "DEPRECATED — use itdasy-frontend-test-yeunjun" 명시
  - (c) 레포 삭제
- **연준님 판단 필요 가능성**: 레포 삭제/아카이브 권한 보유 시 (a) 또는 (b) 진행 여부 결정. **원영 + 연준 합의 필요**.

---

## 백엔드 영향 가능성 있는 것

### T-417 · Done · `app-oauth-return.js:42 switchTab` legacy fallback 제거
- **발견**: P3.2 Phase 2 완료 후 Sonnet-A 보고
- **처리 완료 (P3.3, `88e25f7`)**: 셀렉터를 `.tab-bar__btn[data-tab="home"]` 로 교체하고 `switchTab` dead fallback 삭제. OAuth 리턴 후 홈 탭 활성화 동작 정상화.
- **연준님 참조**: 이전에 OAuth 완료 후 탭 이동이 불안정했던 리포트가 있었으면 본 건 영향. 재현 확인되면 원영에게 공유.

---

## 프론트 한정 — 알아만 두시면 되는 것

### T-402 · Open · 설정시트 PTR 간섭
- 설정시트 열고 스크롤 시 Pull-to-Refresh 발동 → 페이지 새로고침
- P7 에서 해결 예정

### T-403 · Done · 설정시트 상단 "대시보드" 메뉴 안 보임
- **P3.2 에서 메뉴 자체 제거로 해결.** 이제 "대시보드" 는 하단 tab-bar 로 접근.

### T-401 · Open · 클래스/토글 네이밍 혼재
- `.chip.active` (flat) vs `.chip--active` (BEM) 혼재
- `.ws-panel--open`, `.ws-editor--open` (BEM) 도입됨
- P9 에서 일괄 통일

### T-404 · Open · 체크 아이콘 이원화
- slotPopup 완료 버튼: inline SVG
- ws-slot-card done badge: `#ic-check-circle` sprite
- P9 에서 sprite 로 통일

### T-406 · Open · inline JS SVG 상수 → sprite 통합
- P3-B rev1 에서 `_IC_PALETTE`, `_IC_SAVE`, `_IC_GRID` 등 inline 으로 처리
- P9 에서 sprite 로 이관. JS 파일 -30~40줄 예상.

### T-409 · Open · gallery-review.css 토큰화 미흡
- `color: #dc3545` → `var(--danger)` 등
- P9 일괄 처리

### T-410 · Open · 토스트 이모지 정책 모호
- `showToast('...✨')` 식 이모지 토스트 남아있음
- "이모지 전부 교체" 정책이 string 내부까지 포함하는지 결정 필요
- P9 에서 09 디자인시스템 §X.X 정책 명문화 후 일괄 적용

### T-411 · Open · 갤러리 리뷰 아이콘 의미 구분
- 📸(카메라) vs 📱(모바일) → 모두 `#ic-image` 로 단일화된 상태
- P9 에서 `#ic-camera`, `#ic-smartphone` sprite 추가 후 재분리

### T-413 · Open · 파워뷰 엑셀 label 이모지 (`📥`)
- `app-power-view.js` "📥 엑셀 불러오기"
- "이모지 전부 교체" 위반
- P9 에서 `#ic-upload` 또는 `#ic-file` 로 치환

### T-415 · Open · 잔존 이모지 일괄 치환
- `✨` / `📸` / `🎁` / `🔧` — 아직 남아있는 이모지들
- P9 sprite 확장 후 일괄 치환

### T-416 · Open · `app-core.js` 1194줄 리팩토링 (CLAUDE.md 규칙 위반)
- **중요**: CLAUDE.md "1000줄 초과 → 반드시 리팩토링" 규칙 위반 지속 상태
- 예상 분할: `app-core-nav.js` (라우팅) + `app-core-utils.js` (유틸) + `app-core.js` (부팅)
- **주의**: 공용 API 시그니처 유지. 기존 import 경로 호환.
- 연준님이 만약 이 파일을 건드릴 계획이 있다면 오케스트레이터와 충돌 주의

### T-418 · Open · Stylelint pre-existing 에러 145건 일괄 정리
- **배경**: P3.3 Phase 2 커밋 시 pre-commit 훅이 기존 에러 154건(이후 145건으로 감소)에 걸려 차단됨
- **처리**: 원영 승인 하에 `--no-verify` 1회 사용. 신규 위반 0건 검증 후 진행 (커밋 메시지 명시).
- **잔여 위반 대부분**: `style-components.css` 내 color/spacing 토큰화 미흡
- **처리 Phase**: P9 일괄 정리
- **연준님 참조**: 이 에러들은 디자인 개편과 무관한 pre-existing. 백엔드/배포 영향 없음.

### T-419 · Open · 포트폴리오 잔존 고아 함수 6개 재검토
- **배경**: P3.3 `c2a8f72` 에서 포트폴리오 함수 23개 삭제. 아래 6개는 호출 관계 불명확으로 보존.
  - `loadPortfolio`
  - `openPortfolioItem`
  - `deletePortfolioItem`
  - `initLongPressUpload`
  - `initCardDeck`
  - `renderBgStoreGrid`
- **처리 Phase**: P4 글쓰기 캡션 진입 전 또는 P9 일괄 정리 시 호출 트레이스 재확인 후 삭제 여부 판단
- **연준님 참조**: 만약 백엔드 API 호출이 이 함수들에 엮여 있다는 리포트 있으면 공유 바람 (현재 확인된 바 없음).

---

## 디자인 세션 내부 — 연준님 무관

다음은 디자인 개편 내부 이슈로 연준님 개입 불필요. 참고용.

### T-401, T-404, T-406, T-409, T-410, T-411
위에 요약된 항목들 — P9 일괄 처리 예정

### T-412 · Open · P3-A import-wizard 재적용
- G3 rebase 시 main 의 신기능과 충돌 → P3-A 의 디자인 적용분 reset
- 별도 미니 Phase 로 재적용 필요

### T-405 · Cancelled
폐기.

### T-414 · Done
엑셀 label 복원 (G3 Step 1.6 follow-up `c979940` 완료).

---

## 요약: 연준님이 지금 당장 할 것

**없음.**

단, 다음 중 하나 이상에 해당하면 원영/오케스트레이터에게 리포트:
1. OAuth 리턴 후 의도한 탭으로 이동 안 되는 리포트를 받은 적 있음 → T-417 우선순위 상승
2. `Nopo-lab/itdasy-studio` 아카이브/삭제 결정 필요 → T-408 처리
3. `app-core.js` 에 직접 수정 계획 있음 → T-416 충돌 주의 전달
