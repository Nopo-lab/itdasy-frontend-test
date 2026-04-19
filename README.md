# itdasy Frontend Test — 연준 전용 (✅스테이징)

연준의 메인 프론트 작업 공간. 스테이징 백엔드 바라봄.

> 공동작업 가이드·레포 지도: [루트 `../README.md`](../README.md)
> 프로젝트 규칙: [루트 `../CLAUDE.md`](../CLAUDE.md)
> 이 레포 특수 규칙: [`CLAUDE.md`](./CLAUDE.md)

## 배포 URL

- Web: https://nopo-lab.github.io/itdasy-frontend-test-yeunjun/
- API: https://itdasy260417-staging-production.up.railway.app (스테이징)

## 로컬 실행

```bash
# 웹 서빙
python3 -m http.server 8080

# Capacitor sync
npm install
npx cap sync android
```

## GitHub Actions

| 워크플로우 | 트리거 | 용도 |
|---|---|---|
| `Android Build` | 수동 | debug APK / release AAB (signed) |
| `Supabase Daily Backup` | KST 03:00 | 운영+스테이징 pg_dump |
| Pages 배포 | push main | 자동 |

## 필요 GitHub Secrets

Keystore (4개): `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`
DB (3개): `SUPABASE_PROD_DB_URL`, `SUPABASE_STAGING_DB_URL`, `SUPABASE_DB_URL`

## 핵심 파일 (크기 주의)

🔴 >1000줄 (TECH_DEBT 분할 예정):
- `app-caption.js` 1167
- `app-portfolio.js` 1023
- `app-gallery.js` 1016
- `style.css` 1383

🟠 >700줄:
- `app-core.js` 831
- `index.html` 1071 (빌드툴 부재로 보류)

🟢 네이티브 통합:
- `app-haptic.js`, `app-push.js`, `app-oauth-return.js`, `app-plan.js`

## APK 다운로드

- 로컬: `/Users/kang-yeonjun/Downloads/itdasy-apk/app-debug.apk`
- Release: https://github.com/Nopo-lab/itdasy-frontend-test-yeunjun/releases
