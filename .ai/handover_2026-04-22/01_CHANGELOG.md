# 01 변경내역 — G3 / P3.1 / P3.2 / P3.3

> 2026-04-22 하루 동안 main 에 푸시된 디자인 개편 커밋 전체 기록.
> 레포: `Nopo-lab/itdasy-frontend-test-yeunjun`
> 기반: `740d96b` (T-200-P2) → 최종 `88e25f7`

---

## 개요 — 4단계 머지

```
740d96b (기준선)
  │
  ├── G3 (17 커밋) ─── 560789f
  │     P2.5 / P2.5-rev1 / P2.6 / P3-A / P3-B(panels) / P3-B(review)
  │
  ├── P3.1 hotfix (5 커밋) ─── ec93c53
  │     실기기 QA 5 이슈 해결
  │
  ├── P3.2 nav 이관 (5 커밋) ─── 84a4402
  │     상단 nav → 하단 tab-bar + AI추천 흡수
  │
  └── P3.3 nav 잔재 정리 (3 커밋) ─── 88e25f7
        #tab-portfolio 제거 + 고아 함수 23개 + switchTab fallback (총 -876줄)
```

---

## G3 머지 (`560789f`, 2026-04-22)

### 구성 브랜치 3개

| 브랜치 | 스코프 | 주요 커밋 |
|--------|--------|-----------|
| P2.5 (파워뷰·임포트) + P2.5-rev1 (리팩토링) | 상세화면 팩 | `c979940` (엑셀 label 복원) |
| P2.6 (상세 팩) + P3-A (작업실 shell) | 작업실 슬롯 편집 | `008fe13` / `0750950` / `be1401c` / `efd29aa` |
| P3-B (gallery panels) + P3-B (review) | 갤러리 배경/템플릿/요소/리뷰 | `07fbaca` / `427d461` / `f4671d6` / `7f1f72e` |

### 신규 파일

| 파일 | 줄수 | 용도 |
|------|------|------|
| `www/js/app-gallery-bg.js` | 374 | 배경 편집 패널 |
| `www/js/app-gallery-template.js` | (생성) | 템플릿 편집 |
| `www/js/app-gallery-element.js` | 342 | 요소(스티커/텍스트) 편집 |
| `www/js/app-gallery-review.js` | 301 | 리뷰 편집 패널 |
| `www/js/app-gallery-power-view-render.js` | 463 | 파워뷰 렌더 분리 |
| `www/css/screens/gallery-panels.css` | 187 | 패널 공용 스타일 |
| `www/css/screens/gallery-review.css` | 286 | 리뷰 패널 스타일 |

### `www/css/screens/` 전체 구성

G3 완료 시점 스크린별 CSS 분리 정립:
- `dashboard.css`
- `home.css`
- `details.css`
- `power-view.css`
- `workshop.css`
- `gallery-panels.css`
- `gallery-review.css`

그리고 P3.2 에서 추가된:
- `tab-bar.css` (101줄, P3.2 신설)

### 엑셀 label 복원 (c979940)

파워뷰 리팩토링 때 `app-power-view-render.js` 분리 과정에서 "엑셀 불러오기" label + `data-no-voice` 속성이 누락. 따로 follow-up 커밋으로 복원.

---

## P3.1 hotfix 머지 (`ec93c53`, 2026-04-22)

실기기 QA 에서 발견된 5 이슈를 5 커밋으로 해결.

### 커밋별 변경

| SHA | 제목 | 파일 |
|-----|------|------|
| `f38424b` | SVG sprite stroke 일괄 통일 | `index.html` (sprite 섹션, 27개 심볼에 `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"` 적용. `ic-star`/`ic-more-horizontal` 예외) |
| `fbf6cd6` | 패널 transition 적용 | `www/css/screens/workshop.css` +15줄 (`visibility + opacity + transform + pointer-events` 전환, `prefers-reduced-motion` 대응) |
| `4cd80ba` | `showTab()` 외부 팝업 close | `www/js/app-core.js` +5줄 (`closeSlotPopup()` + `#_nextSlotGuide.style.display='none'` 강제) |
| `54d2c4a` | 설정시트 🌙 → Lucide SVG | `www/index.html` +3줄 (`#themeToggleBtn`/`#themeToggleIcon` id + `#ic-sun`/`#ic-moon` 사용, label "자동" → "라이트") |
| `ec93c53` | 설정시트 다크모드 재정의 | `www/style-dark.css` +17줄 (`#settingsCard { background: var(--surface) }` 등) |

### 왜 필요했나

- **#1 배경 패널 transition 없음**: `display:none↔flex` 스위칭 → 즉시 나타남. 09 §5.6 전환 스펙 미적용.
- **#2 탭 전환 시 잔존 UI**: `showTab()` 이 `.tab` 바깥 `position:fixed z-index:9400` 요소(`#slotPopup`, `#_nextSlotGuide`) 를 닫지 않음.
- **#3 SVG 검정 도형**: sprite symbol 에 stroke 속성 누락 → `currentColor` inherit 안 됨.
- **#4 🌙 잔존 이모지**: "이모지 전부 교체" 9대 결정 위반. 다크 토글 아이콘 교체.
- **#5 다크모드 설정시트 흰 배경**: `#fff` 하드코딩. 다크 테마에서 깨짐.

### 영향받는 기능

없음. **시각 교정만**. 기능 로직은 건드리지 않음.

---

## P3.2 nav 이관 머지 (`84a4402`, 2026-04-22)

### 구조 변경 요약

**이전 (Before):**
```
[상단 nav 5 버튼: 홈 / 작업실 / 글쓰기 / AI추천 / 마무리]
  ↓ (각 탭 독립)
#tab-home / #tab-workshop / #tab-caption / #tab-ai-suggest / #tab-finish
```

**이후 (After):**
```
[하단 tab-bar: 홈 / 작업실 / (FAB 글쓰기) / 대시보드 / 마무리]
  ↓
#tab-home / #tab-workshop / #tab-caption / #tab-dashboard / #tab-finish
                                           └── sub-sections:
                                               · KPI (dashboardKpiRoot)
                                               · AI 추천 (#tab-ai-suggest, ID 유지)
                                               · 기타 지표 (dashboardEtcRoot)
```

### 커밋별 변경

| SHA | 제목 | 파일 |
|-----|------|------|
| `ef5713f` | 하단 탭바 HTML + sprite 2개 | `index.html` (sprite: `ic-layers`, `ic-bar-chart-3` 신규. `<nav class="nav">` → `<nav class="tab-bar">` 교체. 각 `.tab-bar__btn` 에 `data-tab` 속성 + 기존 onclick 임시 복사) |
| `159bbaf` | `.nav` CSS 제거 + `tab-bar.css` 신규 | `style-base.css` (.nav 관련 -36줄), `css/screens/tab-bar.css` 신규 101줄 (FAB translateY(-12px) + :active scale(0.96) 포함) |
| `85433a9` | `#tab-dashboard` 생성 + `#tab-ai-suggest` 흡수 | `index.html` (`#tab-dashboard` 신설, 내부에 KPI/AI추천/기타 3개 sub-section. `#tab-ai-suggest` ID 유지하며 dashboard 내부로 이동) |
| `a18dcd8` | `openDashboard()` → `showTab('dashboard')` | `app-dashboard.js` -16줄 (최종 452줄). 바텀시트 오픈 로직 제거. `initDashboardTab()` 신규 (≤50줄, KPI/기타 루트 주입) |
| `84a4402` | `.nav-btn` 셀렉터 11건 일괄 교체 + 설정시트 "대시보드" 버튼 제거 | 8개 파일, 설정시트 T-403 동시 해결 |

### 사후 확장 판단 3건 (Sonnet-A 재량, 승인 처리)

1. **`is-active` → `active` 단일화** — 기존 `showTab()` 이 `active` 를 토글하므로 CSS 클래스명 정합성 필수였음. `.tab-bar.css` 에서 `.is-active` 블록 제거.
2. **셀렉터 11건 일괄 교체** — 당초 프롬프트는 3곳 명시 (`app-core.js:177`, `app-gallery-finish.js:41`, `index.html` inline onclick). 실제로는 8개 파일 11건 존재. 전량 `.tab-bar__btn[data-tab="..."]` 로 교체. 안 했으면 클릭 시 active 하이라이트 깨짐.
3. **`app-gallery-finish.js:41` pre-existing 버그 정정** — 마무리 탭의 "AI추천에서 확인 →" 버튼이 원래 `showTab('tab-ai-suggest', ...)` 호출이었는데, 이건 `document.getElementById('tab-tab-ai-suggest')` 를 찾는 구조라 **never match**. P3.2 에서 `showTab('dashboard', ...)` 로 논리적 정정. → 이 버튼이 처음으로 동작하기 시작했을 가능성 (이전엔 클릭해도 아무 일 없었을 것).

### 선기존 ESLint 에러 동시 수정

P3.2 작업 중 lint 규칙 위반 13건 발견 (`catch (_) {}` 빈 블록) → `catch (_) { /* ignore */ }` 로 일괄 수정. `--no-verify` 는 사용하지 않음.

### 파일 크기 현황

| 파일 | 현재 줄수 | 500줄 규칙 |
|------|-----------|-------------|
| `www/index.html` | (P3.2 후 +40/-30) | SPA 예외 |
| `www/style-base.css` | 382 | OK |
| `www/css/screens/tab-bar.css` | 101 | OK (신규) |
| `www/js/app-core.js` | **1194** | **초과** — T-416 리팩토링 예정 |
| `www/js/app-dashboard.js` | 452 | OK |
| `www/js/app-gallery-finish.js` | (미확인) | 보고 시 체크 |

`app-core.js` 1194줄은 이번 이관 전부터 초과 상태. CLAUDE.md "1000줄 초과 → 반드시 리팩토링" 규칙 위반 유지 중 → T-416 으로 백로그 등록. P3.3 이후 별도 정비 Phase 로 처리 예정.

---

## P3.3 nav 잔재 정리 머지 (`88e25f7`, 2026-04-22)

P3.2 이관 후 남은 고아 블록/dead code 일괄 정리. **-876줄**.

### 커밋별 변경

| SHA | 제목 | 파일 |
|-----|------|------|
| `1b0ff15` | `#tab-portfolio` 고아 블록 + `.pf-upload-card` CSS 삭제 | `index.html` -275, `style-components.css` -14, `style-dark.css` -1 |
| `c2a8f72` | 포트폴리오 고아 함수 23개 일괄 삭제 (+ helper 3개 동반) | `app-portfolio.js` -431 (17개 함수 + `filterPortfolio` wrapper + `_renderPfGroupLabels` + 상수 12개), `app-caption.js` -155 (5개 함수 + `drawLabel` helper + `imgs` 상수) |
| `88e25f7` | `switchTab` legacy fallback 제거 (T-417) | `app-oauth-return.js:42` — 셀렉터 `[data-tab="home"], button[onclick*="switchTab(\'home\'"]` → `.tab-bar__btn[data-tab="home"]` |

### 보존 처리 (삭제 금지)

- **`renderBASplit`** (app-portfolio.js:562) — `app-gallery-slot-editor.js:346` 에서 공유 사용 → 작업실 슬롯 편집 기능 유지 위해 필수 보존
- `app-caption.js` 시나리오 팝업 / `_doGenerateCaption` 등 "불가침 영역" 전체 — 원영 "이 로직 최고" (루트 `.ai/SESSION_STATE.md` §0)

### 백로그 기록

- T-417 **Done** (switchTab 제거 완료)
- T-418 **Open** — Stylelint 선기존 에러 145건, P9 에서 일괄 정리 예정
- T-419 **Open** — 잔존 고아 함수 6개 (`loadPortfolio`, `openPortfolioItem`, `deletePortfolioItem`, `initLongPressUpload`, `initCardDeck`, `renderBgStoreGrid`) — P3.3 진단 범위 밖이라 보존. P4/P9 에서 재검토.

### Stylelint 선기존 에러 처리 예외 승인

P3.3 3커밋 전부 `--no-verify` 사용. 사유:
- `style-components.css` 등에 **145건 선기존 에러** (내 변경과 무관) 존재
- pre-commit hook 차단 → 정상 커밋 불가
- 145건 수동 수정은 P3.3 범위를 크게 벗어남 (id 네이밍 리팩토링 수준)

**3조건 준수하에 예외 허용** (원영 승인):
1. 커밋 직전/직후 `npx stylelint` 총량 비교로 신규 에러 0건 증명
2. 커밋 메시지 note 필수
3. T-418 백로그 기록

P9 에서 T-418 일괄 처리 시 `--fix` 75건 + 수동 70건 모두 정리 예정.

### 파일 크기 현황 (P3.3 직후)

| 파일 | 줄수 | 500줄 규칙 |
|------|------|-------------|
| `www/index.html` | 1256 | SPA 예외 |
| `www/style-components.css` | 468 | OK |
| `www/style-dark.css` | 207 | OK |
| `www/js/app-portfolio.js` | **592** | **초과** (선기존, T-419 와 연결) |
| `www/js/app-caption.js` | **1016** | **초과** (선기존, 시나리오 팝업 불가침으로 리팩토링 제약) |
| `www/js/app-oauth-return.js` | 63 | OK |

`app-caption.js` 초과는 P4(글쓰기 캡션) 에서 시나리오 팝업 외 영역 재편할 때 처리. `app-portfolio.js` 초과는 T-419 해결 시 대폭 감소 예상.

---

## 검증 상태

- **자동 검증**: `node --check` 전 JS 파일 통과 (매 Phase 확인)
- **실기기 QA**: 원영 건너뜀. main 배포본(GitHub Pages)으로 후속 확인
- **잔여 데스크톱 QA** (P3.3 추가):
  - 홈 로고 클릭 → 홈 탭 이동
  - 마무리 탭 "AI추천에서 확인 →" 버튼 → 대시보드 이동 (P3.2 Sonnet-A 정정 실제 작동 확인)
  - 작업실 슬롯 편집에서 `renderBASplit` 호출 시나리오 (P3.3 보존 함수 동작 확인)
  - OAuth 네이티브 리턴 시 홈 탭 이동 (P3.3 T-417 정정 실제 작동 확인)
  - 라이트/다크 탭바 색상
  - 콘솔 에러 0건

연준님이 풀 리퀘스트 확인이나 로컬 빌드 돌리실 때 참고.
