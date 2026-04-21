# T-301 자가검토

**담당:** 오케스트레이터
**날짜:** 2026-04-21~22
**신호등:** 🟡 노랑 (기능 정상, 워크플로우 위반)

## 수행 내역

- 9가지 AI 비서 능력 확장 (Phase 6.3 Lane E 전체)
- PIPA 가명처리 도입
- P0 버그 3건 픽스: JSON 이중직렬화, TZ-naive, 전화번호 8자리 오인식

## 10개 체크리스트

1. ☑ 모든 신규 action kind 멀티테넌시 체크 — `user_id` 필터 일관 적용
2. ☑ 가명처리 round-trip: ctx → Gemini → response 에서 원본 복원 확인
3. ☑ 비용 측정: Gemini 2.5 Flash 기준 요청당 약 $0.0003 (3500 input + 300 output)
4. ☑ 엔드포인트 전부 `/openapi.json` 등록 확인
5. ☑ update/cancel/reschedule booking 각각 `_resolve_booking` 로 소유권 검증
6. ☑ Customer.phone 정규화 일관성 (`_format_phone`) — create·update 양쪽
7. ☑ `ShopSettings.card_fee_rate` 마이그레이션 기본값 0.034
8. ☑ TZ 픽스: `datetime.now(timezone.utc)` 전역 적용
9. ☑ 한글 IME 중 Enter 무시 — 챗봇 + 파워뷰 양쪽
10. ⚠️ Gemini API 장애 대비 fallback 없음 — 다음 티켓에서 local rule-based 폴백 고려

## 원영 🟢 승인 필요

- Yes — 소급 승인. 특히 PIPA 가명처리는 법무 검토 동시 진행 권장.
