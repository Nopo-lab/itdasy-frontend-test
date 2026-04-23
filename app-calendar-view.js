/* ─────────────────────────────────────────────────────────────
   예약 캘린더 뷰 (T-D1 · 2026-04-23)
   커스텀 월/일 뷰 — FullCalendar 의존성 제거.

   전역:
     window.openCalendarView()  — 캘린더 시트 열기
   ──────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const OVERLAY = 'cal-overlay';

  // === 2026 한국 공휴일 (키 형식: "M-D" — padding 없음) ===
  const HOLIDAYS_2026 = {
    '1-1':'신정',
    '2-16':'설날 연휴','2-17':'설날','2-18':'설날 연휴',
    '3-1':'삼일절','3-2':'대체공휴일',
    '5-5':'어린이날','5-25':'부처님오신날',
    '6-6':'현충일',
    '8-15':'광복절','8-17':'대체공휴일',
    '9-24':'추석 연휴','9-25':'추석','9-26':'추석 연휴',
    '10-3':'개천절','10-5':'대체공휴일','10-9':'한글날',
    '12-25':'크리스마스',
  };

  // === 상태 ===
  let _curYear, _curMonth, _curView = 'month', _curDate = new Date();
  let _mappedCache = [];

  const _API  = () => window.API || '';
  const _AUTH = () => (window.authHeader ? window.authHeader() : {});

  // === API ===
  async function _fetchBookings(from, to) {
    try {
      const url = _API() + '/bookings?from=' + encodeURIComponent(from) + '&to=' + encodeURIComponent(to);
      const res = await fetch(url, { headers: _AUTH() });
      if (!res.ok) return { items: [] };
      return res.json();
    } catch (_e) { return { items: [] }; }
  }

  async function _patchBooking(id, patch) {
    const res = await fetch(_API() + '/bookings/' + id, {
      method: 'PATCH',
      headers: { ..._AUTH(), 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error('예약 수정 실패 (' + res.status + ')');
    return res.json();
  }

  // === 매핑 ===
  function _mapBookings(items) {
    return items.map(b => {
      const s = new Date(b.starts_at), e = new Date(b.ends_at);
      return {
        d:    s.getDate(),
        t:    s.toTimeString().slice(0, 5),
        cust: b.customer_name || '이름 없음',
        svc:  b.service_name  || '',
        dur:  Math.round((e - s) / 60000),
        id:   b.id,
        status: b.status,
      };
    });
  }

  async function _loadMonth(year, month) {
    const from = new Date(year, month - 1, 1).toISOString();
    const to   = new Date(year, month, 0, 23, 59, 59).toISOString();
    const res  = await _fetchBookings(from, to);
    return _mapBookings(res.items || []);
  }

  // === DOM 헬퍼 ===
  function _body()  { const o = document.getElementById(OVERLAY); return o && o.querySelector('.cal-body'); }
  function _label() { const o = document.getElementById(OVERLAY); return o && o.querySelector('.cal-month-label'); }

  function _close() {
    const o = document.getElementById(OVERLAY);
    if (o) o.remove();
    document.body.style.overflow = '';
  }

  // === 월 그리드 렌더 ===
  function _renderMonth(year, month, mapped) {
    const body = _body();
    if (!body) return;
    const lbl = _label();
    if (lbl) lbl.textContent = year + '년 ' + month + '월';

    const byDay = {};
    mapped.forEach(m => { (byDay[m.d] = byDay[m.d] || []).push(m); });

    const firstDow  = new Date(year, month - 1, 1).getDay();
    const lastDate  = new Date(year, month, 0).getDate();
    const prevLast  = new Date(year, month - 1, 0).getDate();
    const today     = new Date();
    const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];

    let html = '<div class="cv-wk-hdr">';
    DAY_NAMES.forEach(d => { html += '<div>' + d + '</div>'; });
    html += '</div><div class="cv-cal-grid">';

    for (let i = 0; i < firstDow; i++) {
      html += '<div class="cv-cell other"><div class="cv-num">' + (prevLast - firstDow + 1 + i) + '</div></div>';
    }

    for (let d = 1; d <= lastDate; d++) {
      const dow     = (firstDow + d - 1) % 7;
      const isToday = (today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === d);
      const hkey    = month + '-' + d;
      const holiday = HOLIDAYS_2026[hkey];
      const dateStr = year + '-' + String(month).padStart(2, '0') + '-' + String(d).padStart(2, '0');

      let cls = 'cv-cell';
      if (isToday)          cls += ' today';
      if (dow === 0 || holiday) cls += ' sun';
      if (dow === 6)        cls += ' sat';
      if (holiday)          cls += ' holiday';

      html += '<div class="' + cls + '" onclick="_calSelectDay(\'' + dateStr + '\')">';
      html += '<div class="cv-num">' + d + '</div>';
      if (holiday) html += '<div class="cv-holiday-name">' + holiday + '</div>';

      const items = byDay[d] || [];
      if (items.length) {
        html += '<div class="cv-mini-list">';
        items.slice(0, 3).forEach(it => {
          html += '<div class="cv-mini-card">' + it.cust + '</div>';
        });
        if (items.length > 3) html += '<div class="cv-mini-more">+' + (items.length - 3) + '건</div>';
        html += '</div>';
      }
      html += '</div>';
    }

    const rem = (firstDow + lastDate) % 7;
    if (rem > 0) {
      for (let i = 1; i <= 7 - rem; i++) {
        html += '<div class="cv-cell other"><div class="cv-num">' + i + '</div></div>';
      }
    }
    html += '</div>';
    body.innerHTML = html;
  }

  // === 일 리스트 렌더 ===
  function _renderDay(date, mapped) {
    const body = _body();
    if (!body) return;

    const dateStr = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    let chipHtml = '<div class="cv-wk-chip" id="cv-day-strip">';
    const DOW = ['일','월','화','수','목','금','토'];
    for (let i = -14; i <= 14; i++) {
      const d = new Date(date);
      d.setDate(d.getDate() + i);
      const ds = dateStr(d);
      chipHtml += '<button class="' + (i === 0 ? 'active' : '') + '" onclick="_calSelectDayChip(\'' + ds + '\')" data-date="' + ds + '">';
      chipHtml += '<span style="font-size:10px">' + DOW[d.getDay()] + '</span>';
      chipHtml += '<span style="font-size:14px;font-weight:700">' + d.getDate() + '</span>';
      chipHtml += '</button>';
    }
    chipHtml += '</div>';

    const dayItems = mapped.filter(m => m.d === date.getDate());
    const dayLabel  = date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월 ' + date.getDate() + '일';
    let slotsHtml   = '<div class="cv-d-hd"><span style="font-size:14px;font-weight:700">' + dayLabel + '</span><span style="font-size:12px;color:var(--text-subtle)">' + dayItems.length + '건</span></div>';

    if (!dayItems.length) {
      slotsHtml += '<div class="cv-d-empty">예약이 없어요</div>';
    } else {
      dayItems.forEach(it => {
        slotsHtml += '<div class="cv-d-slot"><div class="cv-d-time">' + it.t + ' · ' + it.dur + '분</div>';
        slotsHtml += '<div class="cv-d-card"><div style="font-size:13px;font-weight:700">' + it.cust + '</div>';
        if (it.svc) slotsHtml += '<div style="font-size:11px;color:var(--text-subtle)">' + it.svc + '</div>';
        slotsHtml += '</div></div>';
      });
    }

    body.innerHTML = chipHtml + slotsHtml;
    setTimeout(() => {
      const strip  = document.getElementById('cv-day-strip');
      const active = strip && strip.querySelector('.active');
      if (active) active.scrollIntoView({ inline: 'center', behavior: 'smooth' });
    }, 50);
  }

  // === 뷰 토글 ===
  function _switchView(view) {
    _curView = view;
    const o = document.getElementById(OVERLAY);
    if (!o) return;
    o.querySelectorAll('.cal-view-toggle button').forEach(b => {
      b.classList.toggle('active', b.dataset.view === view);
    });
    if (view === 'month') _renderMonth(_curYear, _curMonth, _mappedCache);
    else _renderDay(_curDate, _mappedCache);
  }

  // === 월 네비게이션 ===
  async function _prevMonth() {
    _curMonth--;
    if (_curMonth < 1) { _curMonth = 12; _curYear--; }
    _mappedCache = await _loadMonth(_curYear, _curMonth);
    _renderMonth(_curYear, _curMonth, _mappedCache);
  }
  async function _nextMonth() {
    _curMonth++;
    if (_curMonth > 12) { _curMonth = 1; _curYear++; }
    _mappedCache = await _loadMonth(_curYear, _curMonth);
    _renderMonth(_curYear, _curMonth, _mappedCache);
  }

  // === 전역 onclick 핸들러 ===
  window._calSelectDay = function(dateStr) {
    _curDate = new Date(dateStr + 'T00:00:00');
    _switchView('day');
  };
  window._calSelectDayChip = function(dateStr) {
    _curDate = new Date(dateStr + 'T00:00:00');
    _renderDay(_curDate, _mappedCache);
  };
  window._calSwitchView  = _switchView;
  window._calPrevMonth   = _prevMonth;
  window._calNextMonth   = _nextMonth;

  // === 진입점 ===
  window.openCalendarView = async function() {
    const existing = document.getElementById(OVERLAY);
    if (existing) existing.remove();

    const now  = new Date();
    _curYear   = now.getFullYear();
    _curMonth  = now.getMonth() + 1;
    _curDate   = now;
    _curView   = 'month';

    const o = document.createElement('div');
    o.id        = OVERLAY;
    o.className = 'cal-overlay-wrap';
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-modal', 'true');
    o.innerHTML = `
      <div class="cal-sheet">
        <div class="cal-sheet-hdr">
          <button class="cal-nav-btn" onclick="_calPrevMonth()">◁</button>
          <span class="cal-month-label">${_curYear}년 ${_curMonth}월</span>
          <button class="cal-nav-btn" onclick="_calNextMonth()">▷</button>
          <div class="cal-view-toggle">
            <button class="active" data-view="month" onclick="_calSwitchView('month')">월</button>
            <button data-view="day" onclick="_calSwitchView('day')">일</button>
          </div>
          <button class="cal-close-btn" onclick="(function(){var o=document.getElementById('${OVERLAY}');if(o)o.remove();document.body.style.overflow=''})()">✕</button>
        </div>
        <div class="cal-body"></div>
      </div>`;

    o.addEventListener('click', e => { if (e.target === o) _close(); });
    document.body.appendChild(o);
    document.body.style.overflow = 'hidden';

    _mappedCache = await _loadMonth(_curYear, _curMonth);
    _renderMonth(_curYear, _curMonth, _mappedCache);
  };

  // 전역 위임 — data-open="calendar-view" 버튼
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-open="calendar-view"]');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    window.openCalendarView();
  }, true);

})();
