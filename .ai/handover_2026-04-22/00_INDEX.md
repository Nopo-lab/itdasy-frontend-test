# 연준님 인수인계 — 디자인 개편 (2026-04-22 작성)

> **최종 업데이트:** 2026-04-22 P3.3 머지 완료 시점
> **작성자:** Cowork 오케스트레이터 (디자인 전용 세션)
> **상태:** P3 시리즈 전부 완료. P3.5 / P4 병렬 착수 대기.

---

## 문서 맵

| 파일 | 용도 | 읽는 순서 |
|------|------|-----------|
| `README.md` | 30초 오프닝 (이것부터) | 0 |
| `00_INDEX.md` | 이 문서 (전체 개요) | 1 |
| `01_CHANGELOG.md` | G3 / P3.1 / P3.2 / P3.3 상세 커밋 + 파일별 영향 | 2 |
| `02_ROADMAP.md` | P3.3 이후 Phase 계획 + 진행 조건 | 3 |
| `03_ISSUES.md` | 백로그 T-401~T-419 요약 (연준이 알아야 할 것만) | 필요 시 |
| `04_TERMINAL_RULES.md` | T-407 재발 방지 — 레포/디렉토리 정합성 | 필요 시 |

---

## 30초 요약

### 뭐가 바뀌었나

**디자인 전면 개편 1차 라운드 완료.** 기준 레포: `Nopo-lab/itdasy-frontend-test-yeunjun`

- **G3 머지 완료** (2026-04-22): `560789f` — 17 커밋. P2.5/P2.6/P3-A/P3-B(panels)/P3-B(review) 전부 main 포함.
- **P3.1 hotfix 머지 완료** (2026-04-22): `ec93c53` — 5 커밋. 실기기 QA 5 이슈 해결 (패널 transition / 외부 팝업 close / SVG sprite stroke / 🌙 이모지 제거 / 설정시트 다크모드).
- **P3.2 nav 이관 머지 완료** (2026-04-22): `84a4402` — 5 커밋. 상단 nav 완전 제거 → 하단 tab-bar (홈/작업실/FAB/대시보드/마무리). AI추천 탭 → 대시보드 흡수 (단일 스크롤).
- **P3.3 nav 잔재 정리 머지 완료** (2026-04-22): `88e25f7` — 3 커밋. **총 -876줄** 감소. `#tab-portfolio` 고아 블록 274줄 삭제, 관련 JS 함수 23개 + helper 동반 삭제, `switchTab` legacy fallback 제거 (T-417 해결).

**원격 main SHA: `88e25f7c6629018250ecc0fff6496c11d17b5639`**

### 연준님이 지금 알아둘 것 (필수)

1. `#tab-ai-suggest` 는 이제 `#tab-dashboard` 내부 sub-section. ID 는 유지 (JS 호환). DOM 위치만 이동.
2. 하단 nav 는 `.tab-bar__btn[data-tab="..."]` 로 식별. 인덱스 참조 전부 폐기. 새 기능 붙일 때 `data-tab` 속성으로 선택할 것.
3. `openDashboard()` 는 더 이상 바텀시트 아님 → `showTab('dashboard', btn)` 호출. `initDashboardTab()` 가 KPI/기타 루트 주입.
4. 상단 `<nav class="nav">` HTML · `.nav`/`.nav-btn` CSS 전부 삭제됨. 관련 CSS/JS 참조 있으면 깨질 수 있음.
5. `css/screens/tab-bar.css` 신규 파일 (101줄). `index.html <head>` 에 link 추가됨.
6. `app-gallery-finish.js:41` pre-existing 버그 수정됨: `showTab('tab-ai-suggest', ...)` (never match) → `showTab('dashboard', ...)`
7. **`#tab-portfolio` 전체 제거 완료** (P3.3, -274줄). 관련 `app-portfolio.js` / `app-caption.js` 함수 다수 삭제. `renderBASplit` 은 보존 (작업실 슬롯 편집 공유 사용).
8. `app-oauth-return.js:42` 셀렉터가 `.tab-bar__btn[data-tab="home"]` 로 교체됨. 기존 `switchTab` dead fallback 제거.

### 연준님이 지금 안 해도 되는 것

- P3 시리즈 전부 완료. 연준님 당장 해야 할 작업 없음.
- 아래는 백로그 기록만 (연준 개입 불필요):
  - T-418 Stylelint 선기존 에러 대량 (145건) — P9 일괄 정리
  - T-419 잔존 고아 함수 6개 (`loadPortfolio`, `openPortfolioItem` 등) — P4/P9 재검토
  - T-416 `app-core.js` 1194줄 리팩토링 — 별도 정비 Phase

### 백엔드 쪽 (연준님 직접)

**이번 디자인 개편에서 백엔드 변경 없음.** 전부 프론트엔드 한정. 기존 API 스펙 그대로 작동해야 정상.

단, 지난 작업(T-330-B) 노쇼 제거 건이 아직 백엔드에 남아있으면 그건 별개 건. `.ai/tickets/T-330-B-backend.md` 확인 바람.

---

## 지금 상태 스냅샷

| 항목 | 상태 |
|------|------|
| 현재 Phase | P3 시리즈 완료, P3.5/P4 착수 대기 |
| 원격 main | `88e25f7` |
| 활성 브랜치 | 없음 |
| 블로커 | 없음 |
| 실기기 QA 상태 | P3.1/P3.2/P3.3 원영 건너뜀 (main 배포본 활용) |
| 다음 머지 예상 | P3.5(캘린더) ∥ P4(캡션) 병렬 가능 |

---

## 디자인 시스템 SSOT

기준 문서는 디자인 세션 워크스페이스에 있음:
- `기획/09_디자인시스템_v1.md` — 토큰/컴포넌트/스크린 전체 명세
- `기획/09_디자인시스템_v1.md §5.16 rev2` — 하단 tab-bar 구조 (2026-04-22 확정)

연준님이 프론트 새 기능 붙일 때 참고. 요청하면 복사본 공유 가능.
