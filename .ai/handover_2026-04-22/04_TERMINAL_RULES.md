# 04 터미널 운영 규칙 — 레포/디렉토리 정합성

> T-407 후속. 2026-04-22 G3 머지 시점 Sonnet-B 가 구버전 레포에서 작업한 사고 재발 방지.

---

## 1. 배경 (무엇이 틀어졌나)

2026-04-22 G3 디자인 머지 진행 중, 두 터미널이 **서로 다른 레포** 에서 작업 중이었다는 사실이 판명.

| 터미널 | 로컬 경로 | 원격 레포 | 상태 |
|--------|-----------|-----------|------|
| Sonnet-A | `/Users/ahn-wonyoung/itdasy-frontend-test-yeunjun-main` | `Nopo-lab/itdasy-frontend-test-yeunjun` | ✅ 정식 타겟 |
| Sonnet-B | `/Users/ahn-wonyoung/itdasy-studio` | `Nopo-lab/itdasy-studio` | ❌ 구버전 |

결과: Sonnet-B 의 P3-B review 작업이 **타겟 레포에 반영되지 않은 채로 진행**. 머지 직전에 발견, 다행히 수동 전환으로 복구.

---

## 2. 재발 방지 규칙 (필수)

### 2.1 세션 시작 시 모든 터미널 1회 실행

```bash
pwd && git remote -v && git branch --show-current
```

오케스트레이터 프롬프트 첫 줄에 요구. 응답 없으면 작업 불가.

### 2.2 프롬프트 헤더 타겟 레포 명시

모든 대형 작업 프롬프트 헤더:
```
📤 대상: Sonnet-X @ itdasy-frontend-test-yeunjun
```

레포명이 맞지 않으면 터미널이 스스로 중단하고 보고.

### 2.3 clone 통일 권장

각 개발자/오케스트레이터의 로컬에서 **동일한 디렉토리명 + 동일한 레포** 사용.
- 로컬 경로 표준: `~/itdasy-frontend-test-yeunjun-main/` (또는 개인 설정)
- 원격: `Nopo-lab/itdasy-frontend-test-yeunjun`

### 2.4 터미널 다를 때 처리

불가피하게 두 터미널이 서로 다른 clone 을 쓰면:
- 한쪽 작업 끝날 때마다 **`git push` 의무**
- 다른 쪽은 작업 시작 전 **`git fetch && git pull` 의무**
- 병합 파일 충돌 전 rebase 체크

---

## 3. 프롬프트 헤더 표준

### 일반 작업 프롬프트

```markdown
📤 대상: Sonnet-A @ itdasy-frontend-test-yeunjun

# [Phase/Ticket] 제목

## 0. 사전 조건
- 베이스: main @ `<sha>`
- 브랜치: `<branch-name>` (신규 / 기존)
- 타겟 경로: `~/itdasy-frontend-test-yeunjun-main/` (clone 이 다르면 보고 후 대기)
```

### 진단 프롬프트 (수정 금지)

```markdown
📤 대상: Sonnet-A @ itdasy-frontend-test-yeunjun
# [Phase] Phase 1 — 진단 (읽기 전용, 수정 금지)

## 0. 전제
- 현재 main: `<sha>`
- ⛔ 파일 수정 금지. 커밋 금지. 보고만.
```

### 머지 프롬프트

```markdown
📤 대상: Sonnet-A @ itdasy-frontend-test-yeunjun
# [Phase] 머지 프롬프트 — main fast-forward + push

## 0. 전제
- 현재 브랜치: `<branch>`
- 타겟: `main` (현재 `<sha>`)
- ⛔ `--no-ff` 금지. rebase 금지. 충돌 나면 중단 후 보고.
```

---

## 4. 병행 작업 충돌 방지

### 같은 파일 두 터미널 금지

티켓 하나 = 터미널 한 개. BOARD.md 에 담당 명시.

### 병렬 가능한 조합

| 조합 | 이유 |
|------|------|
| FE 디자인 + BE 스펙 정리 | 다른 레포 |
| FE `app-dashboard.js` + FE `app-caption.js` | 파일 겹침 없음 |
| FE tab-bar 리팩토링 + FE `app-core.js` 분할 | **금지** (서로 의존) |

### 병렬 불가능한 조합 발견 시

오케스트레이터가 순서 강제. 한 쪽 완료 후 `OK` 확인 전까지 다른 쪽 대기.

---

## 5. 세션 재시작 시 자가진단

각 터미널이 새 세션 시작 후 스스로 답해야 할 질문:

```
Q1. 내 터미널 역할 (Sonnet-A / Sonnet-B)?
Q2. 내 로컬 clone 경로? (`pwd` 결과)
Q3. 내 origin remote URL? (`git remote -v` 결과)
Q4. 현재 브랜치 + HEAD SHA? (`git branch --show-current && git rev-parse HEAD`)
Q5. 내 담당 티켓 ID?
```

5개 중 하나라도 불명확 → 작업 보류, 오케스트레이터에게 clarification 요청.

---

## 6. 응급 상황

### 잘못된 레포에서 작업했음을 뒤늦게 발견

1. **중단 후 보고** — 커밋 더 쌓지 말 것
2. `git format-patch` 로 커밋 패치 추출:
   ```bash
   git format-patch <base>..<head> -o /tmp/patches/
   ```
3. 올바른 레포로 이동 후 `git am /tmp/patches/*.patch` 로 적용
4. 충돌 나면 오케스트레이터 개입

### 오케스트레이터 세션 재시작

1. `AGENTS.md` + 루트 `CLAUDE.md` + `.ai/SESSION_STATE.md` + `.ai/BOARD.md` 순서로 읽기
2. 24시간 이내 체크포인트 있으면 바로 재개
3. 초과 시 각 터미널에 현재 상태 보고 요청
4. 사용자 재개 보고: `세션 재개: 마지막 체크포인트 X, 다음 할 일 Y`

---

## 7. 원영님께 알림

연준님에게 이 문서 공유 시 다음 추가 메모와 함께:
- 현재 정식 레포는 `Nopo-lab/itdasy-frontend-test-yeunjun`
- `Nopo-lab/itdasy-studio` 는 deprecated — T-408 처리 대기
- 혹시 연준님이 예전 URL 로 작업 중이면 즉시 원영에게 보고
- 디자인 세션 오케스트레이터가 직접 레포 수정은 안 함 (디자인 전용). 모든 코드 변경은 Sonnet-A/B 를 통해 진행.
