# itdasy-frontend-test-yeunjun (연준 스테이징)

> 루트 `../CLAUDE.md` 의 모든 규칙을 상속. 여기는 **스테이징 전용** 특수 사항만.

## 이 레포의 역할

- **연준 전용 프론트 검증** 레포
- 배포: GitHub Pages `https://nopo-lab.github.io/itdasy-frontend-test-yeunjun/`
- 바라보는 백엔드: `itdasy_backend-test` (Railway staging)
- 토큰 localStorage 키: `itdasy_token::staging` (운영과 격리)

## 워크플로우

1. 모든 프론트 변경은 여기서 먼저
2. 검증 완료 후 (사용자 지시 있을 때) `itdasy-frontend` (운영) 로 승격
3. "원영 test 에도 올려" 명시 지시 있을 때만 `itdasy-frontend-test` 동기화

## Capacitor 설정 특이사항

- `capacitor.config.json`
  - `server.url: https://nopo-lab.github.io/itdasy-frontend-test-yeunjun/`
  - scheme: `itdasy://` (OAuth 딥링크)
  - plugins: SplashScreen, StatusBar, PushNotifications, Camera, App
- `android/app/google-services.json` 배치됨 (프로젝트 `itdasy`)
- Keystore 파일은 레포에 없음 (GitHub Secrets 경로: `ANDROID_KEYSTORE_BASE64`)

## GitHub Actions

- `Android Build` — 수동 실행 (`workflow_dispatch`). debug/release 선택 가능.
- `Supabase Daily Backup` — 매일 UTC 18:00 (한국 03:00), 운영+스테이징 2개 DB 덤프
- push 때마다 빌드 X (시간·비용)

## 주요 파일 안내

- 진입: `index.html`
- 핵심 JS: `app-core.js`, `app-caption.js`, `app-gallery.js`, `app-portfolio.js`, `app-instagram.js`
- 네이티브 래퍼: `app-haptic.js`, `app-push.js`, `app-oauth-return.js`, `app-plan.js`
- ⚠️ `app-caption.js` / `app-portfolio.js` / `app-gallery.js` / `style.css` 는 1000줄+ → `../TECH_DEBT.md` 에 분할 계획

## 로컬 개발

```bash
# 웹 서빙 (간이)
python3 -m http.server 8080

# Capacitor sync (네이티브 프로젝트 반영)
npm install
npx cap sync android
# iOS는 Apple Dev 승인 후: npx cap add ios && npx cap sync ios

# Android APK 빌드 (로컬) — Android SDK 필요. GitHub Actions 권장
```

## 공동 규칙 참조

- 루트 `../CLAUDE.md` — 전체 규칙
- 루트 `../README.md` — 5개 레포 매트릭스
- 루트 `../TODO.md` — 출시 체크리스트
