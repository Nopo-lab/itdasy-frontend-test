/* app-reel.js — 릴스 만들기 메인 컨트롤러 */
(function () {
  'use strict';

  var POLL_MS = 3000, POLL_MAX_MS = 300000;

  var state = {
    step: 'IDLE', templateId: null, sourceVideos: [],
    serviceInfo: { service_name: '', customer_handle: '', customer_consent: false },
    generationId: null, renderUrl: null,
  };

  var _pollTimer = null, _pollStarted = null, _stage = null;

  function _ah() {
    var t = typeof getToken === 'function' ? getToken() : null;
    return t ? { 'Authorization': 'Bearer ' + t, 'ngrok-skip-browser-warning': 'true' } : {};
  }
  function _toast(m) { if (typeof showToast === 'function') showToast(m); else console.warn('[reelApp]', m); }
  function _btn(el) {
    el.style.transition = 'transform .15s';
    ['pointerdown','pointerup','pointerleave'].forEach(function (ev) {
      el.addEventListener(ev, function () { el.style.transform = ev === 'pointerdown' ? 'scale(.97)' : ''; });
    });
  }
  function _esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }

  // ── 진입 / 종료 ───────────────────────────────────────────────
  function open() {
    _reset();
    _stage = document.getElementById('reelStage');
    if (!_stage) { console.error('[reelApp] #reelStage 없음'); return; }
    document.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
    document.querySelectorAll('.tab-bar button').forEach(function (b) { b.classList.remove('active'); });
    _stage.classList.add('active');
    window.scrollTo(0, 0);
    _render();
    if (window.reelTemplate) window.reelTemplate.init().then(_refreshTpl);
  }

  function close() { _stopPoll(); _reset(); if (typeof showTab === 'function') showTab('home', null); }

  function _reset() {
    state.step = 'IDLE'; state.templateId = null; state.sourceVideos = [];
    state.serviceInfo = { service_name: '', customer_handle: '', customer_consent: false };
    state.generationId = null; state.renderUrl = null;
  }

  function selectTemplate(id) {
    state.templateId = id;
    var tpl = window.reelTemplate && window.reelTemplate.state.templates.find(function (t) { return t.id === id; });
    var badge = document.getElementById('reelTplBadge');
    if (badge) badge.textContent = tpl ? tpl.name : '선택됨';
  }

  // ── 영상 추가 ─────────────────────────────────────────────────
  async function addVideos(files) {
    var arr = Array.from(files);
    if (state.sourceVideos.length + arr.length > 5) { _toast('영상은 최대 5개까지 추가할 수 있어요'); return; }
    for (var i = 0; i < arr.length; i++) {
      var f = arr[i];
      var dur = await _getVidDur(f);
      if (dur > 60) { _toast('"' + f.name.slice(0,16) + '" — 영상이 너무 길어요 (1분 이내 권장)'); continue; }
      var thumbBlob = null;
      if (window.reelKeyframe) {
        try { thumbBlob = (await window.reelKeyframe.extract(f, [0.0]))[0]; } catch (e) { /* ignore */ }
      }
      state.sourceVideos.push({ file: f, url: null, thumbBlob: thumbBlob, keyframeUrls: [], label: f.name });
    }
    _renderVideoList(); _toggleInfo();
  }

  function _getVidDur(file) {
    return new Promise(function (resolve) {
      var v = document.createElement('video');
      v.preload = 'metadata';
      v.onloadedmetadata = function () { URL.revokeObjectURL(v.src); resolve(v.duration || 0); };
      v.onerror = function () { resolve(0); };
      v.src = URL.createObjectURL(file);
    });
  }

  // ── 렌더 ─────────────────────────────────────────────────────
  function _render() {
    _stage.innerHTML = [
      '<div style="min-height:100vh;background:var(--bg);padding-bottom:120px;">',
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px 8px;">',
      '<button onclick="window.reelApp.close()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:14px;display:flex;align-items:center;gap:4px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>닫기</button>',
      '<h2 style="margin:0;font-size:17px;font-weight:800;">릴스 만들기</h2>',
      '<button id="reelTplToggle" style="background:none;border:1px solid var(--border-strong);border-radius:10px;padding:6px 10px;cursor:pointer;font-size:12px;color:var(--text);"><span id="reelTplBadge">템플릿</span> ▾</button>',
      '</div>',
      '<div id="reelTplRow" style="max-height:0;overflow:hidden;transition:max-height .35s ease;padding:0 20px;"><div id="reelTplCont"></div></div>',
      '<div style="padding:0 20px;margin-top:12px;">',
      '<div id="reelDrop" onclick="document.getElementById(\'reelVidInput\').click()" style="border:2px dashed var(--border-strong);border-radius:20px;padding:32px 20px;text-align:center;cursor:pointer;color:var(--text-muted);transition:border-color .2s;">',
      '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="display:block;margin:0 auto 10px;"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="m10 8 6 4-6 4V8z"/></svg>',
      '<div style="font-weight:800;font-size:15px;margin-bottom:4px;">시술 영상을 던져보세요</div>',
      '<div style="font-size:13px;">1~5개 · 1분 이내 · mp4/mov</div></div>',
      '<input type="file" id="reelVidInput" accept="video/*" multiple style="display:none">',
      '</div>',
      '<div id="reelVidList" style="display:flex;gap:10px;overflow-x:auto;padding:12px 20px 4px;scrollbar-width:none;min-height:10px;"></div>',
      '<div id="reelInfoSec" style="max-height:0;overflow:hidden;transition:max-height .4s ease;">',
      '<div style="padding:4px 20px 0;"><div style="border-top:1px solid var(--border-strong);margin:8px 0 16px;"></div>',
      '<label style="font-size:12px;font-weight:700;display:block;margin-bottom:6px;">시술명 <span style="color:var(--accent);">*</span></label>',
      '<input type="text" id="reelSvcName" placeholder="예: 글루타치온 리프팅" autocomplete="off" style="width:100%;box-sizing:border-box;border-radius:12px;border:1px solid var(--border-strong);padding:12px;font-size:14px;background:var(--surface-2);color:var(--text);margin-bottom:12px;">',
      '<label style="font-size:12px;font-weight:700;display:block;margin-bottom:6px;">고객 인스타 @핸들 <span style="color:var(--text-muted);font-weight:400;">(선택)</span></label>',
      '<input type="text" id="reelHandle" placeholder="@handle" style="width:100%;box-sizing:border-box;border-radius:12px;border:1px solid var(--border-strong);padding:12px;font-size:14px;background:var(--surface-2);color:var(--text);margin-bottom:14px;">',
      '<label style="display:flex;align-items:center;gap:10px;cursor:pointer;margin-bottom:4px;"><input type="checkbox" id="reelConsent" style="width:18px;height:18px;accent-color:var(--accent);"><span style="font-size:14px;">고객에게 동의 받았어요</span></label>',
      '</div></div>',
      '<div id="reelStepper" style="display:none;padding:20px;text-align:center;"><div id="reelStepLbl" style="font-size:14px;color:var(--text-muted);margin-bottom:8px;"></div>',
      '<div style="height:4px;background:var(--border-strong);border-radius:2px;overflow:hidden;"><div id="reelStepBar" style="height:100%;background:var(--accent);width:0%;transition:width .6s;"></div></div></div>',
      '<div id="reelResult" style="display:none;padding:0 20px;"></div>',
      '<div style="position:fixed;bottom:0;left:0;right:0;padding:16px 20px calc(env(safe-area-inset-bottom) + 16px);background:linear-gradient(to top,var(--bg) 70%,transparent);pointer-events:none;">',
      '<button id="reelMakeBtn" onclick="window.reelApp._onMake()" disabled style="width:100%;padding:16px;border-radius:16px;border:none;pointer-events:auto;background:linear-gradient(135deg,var(--accent),var(--accent2,var(--accent)));color:#fff;font-size:16px;font-weight:800;cursor:pointer;opacity:0.4;transition:opacity .2s,transform .15s;">만들기</button>',
      '</div></div>',
    ].join('');

    document.getElementById('reelVidInput').onchange = function (e) { addVideos(e.target.files); };
    var dz = document.getElementById('reelDrop');
    dz.ondragover = function (e) { e.preventDefault(); dz.style.borderColor = 'var(--accent)'; };
    dz.ondragleave = function () { dz.style.borderColor = 'var(--border-strong)'; };
    dz.ondrop = function (e) { e.preventDefault(); dz.style.borderColor = 'var(--border-strong)'; addVideos(e.dataTransfer.files); };
    document.getElementById('reelTplToggle').onclick = function () {
      var row = document.getElementById('reelTplRow');
      row.style.maxHeight = row.style.maxHeight === '400px' ? '0px' : '400px';
    };
    _btn(document.getElementById('reelMakeBtn'));
    _attachSvcAutocomplete();
  }

  function _attachSvcAutocomplete() {
    var input = document.getElementById('reelSvcName');
    if (!input || !window.AppAutocomplete) return;
    var src = window.AppAutocomplete.sources.service_name || [];
    if (!src.length) return;
    var dl = document.createElement('datalist');
    dl.id = 'reelSvcDl';
    src.forEach(function (n) { var o = document.createElement('option'); o.value = n; dl.appendChild(o); });
    input.setAttribute('list', 'reelSvcDl');
    input.parentNode.insertBefore(dl, input.nextSibling);
  }

  function _refreshTpl() {
    var c = document.getElementById('reelTplCont');
    if (c && window.reelTemplate) window.reelTemplate.render(c);
  }

  function _renderVideoList() {
    var list = document.getElementById('reelVidList'); if (!list) return;
    list.innerHTML = '';
    state.sourceVideos.forEach(function (sv, idx) {
      var card = document.createElement('div');
      card.style.cssText = 'flex:0 0 80px;height:80px;border-radius:12px;overflow:hidden;position:relative;background:var(--surface-2);';
      if (sv.thumbBlob) { var img = document.createElement('img'); img.src = URL.createObjectURL(sv.thumbBlob); img.style.cssText = 'width:100%;height:100%;object-fit:cover;'; card.appendChild(img); }
      var x = document.createElement('button');
      x.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      x.style.cssText = 'position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:999px;border:none;background:rgba(0,0,0,.6);color:#fff;cursor:pointer;display:grid;place-items:center;';
      x.onclick = function () { state.sourceVideos.splice(idx, 1); _renderVideoList(); _toggleInfo(); };
      card.appendChild(x); list.appendChild(card);
    });
    _checkMake();
  }

  function _toggleInfo() {
    var info = document.getElementById('reelInfoSec'); if (!info) return;
    info.style.maxHeight = state.sourceVideos.length > 0 ? '400px' : '0px';
    var svc = document.getElementById('reelSvcName'), ch = document.getElementById('reelConsent');
    if (svc) svc.addEventListener('input', _checkMake);
    if (ch)  ch.addEventListener('change', _checkMake);
  }

  function _checkMake() {
    var btn = document.getElementById('reelMakeBtn'); if (!btn) return;
    var ok = state.sourceVideos.length > 0
      && ((document.getElementById('reelSvcName') || {}).value || '').trim()
      && (document.getElementById('reelConsent') || {}).checked;
    btn.disabled = !ok; btn.style.opacity = ok ? '1' : '0.4';
  }

  function _onMake() {
    state.serviceInfo.service_name    = (document.getElementById('reelSvcName')  || {}).value || '';
    state.serviceInfo.customer_handle = (document.getElementById('reelHandle')    || {}).value || '';
    state.serviceInfo.customer_consent = (document.getElementById('reelConsent') || {}).checked;
    start();
  }

  // ── API 흐름 ──────────────────────────────────────────────────
  function _step(label, pct) {
    var s = document.getElementById('reelStepper'), l = document.getElementById('reelStepLbl'), b = document.getElementById('reelStepBar'), mb = document.getElementById('reelMakeBtn');
    if (s) s.style.display = 'block'; if (l) l.textContent = label; if (b) b.style.width = pct + '%';
    if (mb) { mb.disabled = true; mb.style.opacity = '0.4'; }
  }

  async function start() {
    _step('영상 분석 중…', 20);
    typeof hapticMedium === 'function' && hapticMedium();
    try {
      // TODO: 영상 presigned 업로드 연동 (BE 명령서 #4 확정 후)
      console.warn('[reelApp] 영상 업로드 presigned 미연동');
      var videoUrls = state.sourceVideos.map(function (_, i) { return 'placeholder_' + i; });

      _step('키프레임 추출 중…', 35);
      var allKf = [];
      for (var i = 0; i < state.sourceVideos.length; i++) {
        if (window.reelKeyframe) {
          try { await window.reelKeyframe.extract(state.sourceVideos[i].file); } catch(e) { /* ignore */ }
        }
        allKf.push([]);
      }

      _step('자막 만드는 중…', 55);
      var res = await fetch(window.API + '/reel/generations', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, _ah()),
        body: JSON.stringify({ template_id: state.templateId, video_urls: videoUrls, keyframe_urls: allKf,
          service_name: state.serviceInfo.service_name, customer_handle: state.serviceInfo.customer_handle || null,
          customer_consent: state.serviceInfo.customer_consent }),
      });
      if (res.status === 401) { close(); return; }
      if (res.status === 402) { _toast('이번달 한도에 도달했어요. 플랜을 업그레이드해보세요'); _step('한도 초과', 0); return; }
      if (!res.ok) { var e = await res.json().catch(function(){return{};}); throw new Error(e.detail || '생성 요청 실패'); }
      state.generationId = (await res.json()).id;
      await render();
    } catch (e) { _toast('오류: ' + e.message); _step('오류가 생겼어요', 0); }
  }

  async function render() {
    _step('렌더링 중… (1~3분)', 70);
    var res = await fetch(window.API + '/reel/generations/' + state.generationId + '/render', { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, _ah()) });
    if (!res.ok) { var e = await res.json().catch(function(){return{};}); throw new Error(e.detail || '렌더 요청 실패'); }
    await poll();
  }

  async function poll() {
    _stopPoll(); _pollStarted = Date.now();
    return new Promise(function (resolve, reject) {
      _pollTimer = setInterval(async function () {
        if (Date.now() - _pollStarted > POLL_MAX_MS) {
          _stopPoll(); _toast('시간이 오래 걸리고 있어요. 잠시 후 다시 확인해주세요');
          _step('렌더링 지연 중…', 80); resolve(); return;
        }
        try {
          var r = await fetch(window.API + '/reel/generations/' + state.generationId, { headers: _ah() });
          if (!r.ok) return;
          var gen = await r.json();
          if (gen.status === 'completed') {
            _stopPoll(); state.renderUrl = gen.render_url; _step('완성!', 100);
            setTimeout(function () { _showResult(gen); }, 400); resolve();
          } else if (gen.status === 'failed') {
            _stopPoll(); _step('렌더링 실패', 0); _toast('렌더링에 실패했어요. 다시 시도해주세요'); reject(new Error('failed'));
          }
        } catch(e) { console.warn('[reelApp] poll', e); }
      }, POLL_MS);
    });
  }

  function _stopPoll() { if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; } }

  // ── 결과 화면 ─────────────────────────────────────────────────
  function _showResult(gen) {
    var r = document.getElementById('reelResult'); if (!r) return;
    r.style.display = 'block';
    var s = document.getElementById('reelStepper'); if (s) s.style.display = 'none';
    r.innerHTML = '';

    var vid = document.createElement('video');
    vid.src = gen.render_url || ''; vid.autoplay = vid.muted = vid.loop = vid.playsInline = true; vid.controls = true;
    vid.style.cssText = 'width:100%;border-radius:16px;display:block;margin-bottom:16px;';
    r.appendChild(vid);

    var saveBtn = document.createElement('button');
    saveBtn.textContent = '갤러리에 저장';
    saveBtn.style.cssText = 'width:100%;padding:16px;border-radius:16px;border:none;margin-bottom:10px;background:linear-gradient(135deg,var(--accent),var(--accent2,var(--accent)));color:#fff;font-size:16px;font-weight:800;cursor:pointer;';
    saveBtn.onclick = function () { if (window.reelSave) window.reelSave.saveToGallery(gen.render_url || state.renderUrl); };
    _btn(saveBtn); r.appendChild(saveBtn);

    var cw = document.createElement('div');
    cw.style.cssText = 'background:var(--surface-2);border-radius:16px;padding:16px;margin-bottom:10px;';
    if (window.reelCaption) window.reelCaption.bind(cw, gen);
    r.appendChild(cw);

    var fbRow = document.createElement('div'); fbRow.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;';
    ['좋아요 👍', '별로예요 👎'].forEach(function (lbl, i) {
      var fb = document.createElement('button');
      fb.textContent = lbl;
      fb.style.cssText = 'flex:1;padding:10px;border-radius:12px;border:1px solid var(--border-strong);background:var(--surface-2);cursor:pointer;font-size:13px;';
      fb.onclick = function () {
        fetch(window.API + '/reel/generations/' + gen.id + '/feedback', { method: 'POST', headers: Object.assign({'Content-Type':'application/json'}, _ah()), body: JSON.stringify({rating: i===0?'good':'bad'}) }).catch(function(){});
        _toast(i === 0 ? '피드백 감사해요!' : '다음엔 더 잘 만들게요');
        fb.style.cssText += 'background:var(--accent);color:#fff;border:none;';
      };
      _btn(fb); fbRow.appendChild(fb);
    });
    r.appendChild(fbRow);

    var rb = document.createElement('button'); rb.textContent = '새로 만들기';
    rb.style.cssText = 'width:100%;padding:12px;border-radius:14px;border:1px solid var(--border-strong);background:none;color:var(--text);font-size:14px;cursor:pointer;';
    rb.onclick = function () { open(); }; _btn(rb); r.appendChild(rb);
    typeof hapticSuccess === 'function' && hapticSuccess();
  }

  window.reelApp = { state: state, open: open, close: close, selectTemplate: selectTemplate, addVideos: addVideos, start: start, render: render, poll: poll, _onMake: _onMake };
})();
