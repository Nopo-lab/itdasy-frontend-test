/* app-reel-template.js — 릴스 템플릿 학습/선택 UI */
(function () {
  'use strict';

  var state = { templates: [], activeId: null, isLearning: false };

  // ── 내부 헬퍼 ────────────────────────────────────────────────

  function _authHeader() {
    var t = typeof getToken === 'function' ? getToken() : null;
    return t ? { 'Authorization': 'Bearer ' + t, 'ngrok-skip-browser-warning': 'true' } : {};
  }

  function _toast(msg) {
    if (typeof showToast === 'function') showToast(msg);
    else console.warn('[reelTemplate]', msg);
  }

  function _btn(el) {
    el.style.transition = 'transform .15s';
    el.addEventListener('pointerdown', function () { el.style.transform = 'scale(.97)'; });
    el.addEventListener('pointerup',   function () { el.style.transform = ''; });
    el.addEventListener('pointerleave',function () { el.style.transform = ''; });
  }

  // ── 공개 API ─────────────────────────────────────────────────

  async function init() {
    try {
      var res = await fetch(window.API + '/reel/templates', { headers: _authHeader() });
      if (res.status === 401) { showTab && showTab('home'); return; }
      var data = await res.json();
      state.templates = Array.isArray(data) ? data : (data.templates || []);
    } catch (e) {
      console.warn('[reelTemplate] init failed', e);
      state.templates = [];
    }
  }

  function render(containerEl) {
    containerEl.innerHTML = '';

    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;gap:12px;overflow-x:auto;padding:4px 0 8px;scrollbar-width:none;';

    state.templates.forEach(function (tpl) {
      var card = _makeCard(tpl);
      wrap.appendChild(card);
    });

    // + 새 템플릿 카드
    var addCard = document.createElement('div');
    addCard.style.cssText = [
      'flex:0 0 100px;height:130px;border-radius:20px;border:2px dashed var(--border-strong)',
      'display:grid;place-items:center;cursor:pointer;color:var(--text-muted)',
      'font-size:13px;text-align:center;gap:4px;padding:12px;',
    ].join(';');
    addCard.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span>새 템플릿</span>';
    addCard.onclick = function () { startLearn(containerEl); };
    _btn(addCard);
    wrap.appendChild(addCard);

    containerEl.appendChild(wrap);

    // 학습 폼 자리 (숨김 상태)
    var formWrap = document.createElement('div');
    formWrap.id = 'reelLearnForm';
    formWrap.style.cssText = 'max-height:0;overflow:hidden;transition:max-height .35s ease;';
    formWrap.innerHTML = _learnFormHTML();
    containerEl.appendChild(formWrap);

    containerEl.querySelectorAll('[data-haptic]').forEach(function (el) {
      el.addEventListener('click', function () { typeof hapticLight === 'function' && hapticLight(); });
    });
  }

  function _makeCard(tpl) {
    var card = document.createElement('div');
    var isActive = tpl.id === state.activeId;
    card.style.cssText = [
      'flex:0 0 100px;height:130px;border-radius:20px;overflow:hidden',
      'background:var(--surface-2);cursor:pointer;position:relative',
      isActive ? 'box-shadow:0 0 0 2px var(--accent)' : '',
    ].join(';');

    if (tpl.thumbnail_url) {
      var img = document.createElement('img');
      img.src = tpl.thumbnail_url;
      img.style.cssText = 'width:100%;height:80px;object-fit:cover;';
      card.appendChild(img);
    } else {
      var ph = document.createElement('div');
      ph.style.cssText = 'width:100%;height:80px;background:var(--border-strong);display:grid;place-items:center;';
      ph.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="4"/><circle cx="8" cy="8" r="2"/><path d="m21 15-5-5L5 21"/></svg>';
      card.appendChild(ph);
    }

    var info = document.createElement('div');
    info.style.cssText = 'padding:6px 8px;';
    info.innerHTML = '<div style="font-size:11px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + _esc(tpl.name) + '</div>'
      + (isActive ? '<div style="font-size:10px;color:var(--accent);margin-top:2px;">활성</div>' : '');
    card.appendChild(info);

    card.onclick = function () {
      state.activeId = tpl.id;
      typeof hapticLight === 'function' && hapticLight();
      if (window.reelApp) window.reelApp.selectTemplate(tpl.id);
    };

    // 길게 누르면 삭제
    var pressTimer;
    card.addEventListener('pointerdown', function () {
      pressTimer = setTimeout(function () {
        typeof hapticMedium === 'function' && hapticMedium();
        if (confirm('"' + tpl.name + '" 템플릿을 삭제할까요?')) {
          window.reelTemplate.delete(tpl.id);
        }
      }, 700);
    });
    card.addEventListener('pointerup',    function () { clearTimeout(pressTimer); });
    card.addEventListener('pointerleave', function () { clearTimeout(pressTimer); });
    _btn(card);
    return card;
  }

  function _learnFormHTML() {
    return [
      '<div style="padding:16px 0 8px;">',
      '<p style="margin:0 0 12px;font-size:13px;color:var(--text-muted);">레퍼런스 영상을 올리면 AI가 내 스타일을 배워요. 학습은 30~60초 걸려요.</p>',

      '<label style="font-size:12px;font-weight:700;display:block;margin-bottom:6px;">레퍼런스 영상 (1~3개)</label>',
      '<div id="reelLearnDropzone" style="border:2px dashed var(--border-strong);border-radius:14px;padding:20px;text-align:center;',
      'color:var(--text-muted);font-size:13px;cursor:pointer;" onclick="document.getElementById(\'reelLearnVideoInput\').click()">',
      '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="display:block;margin:0 auto 6px;">',
      '<rect x="2" y="2" width="20" height="20" rx="4"/><path d="m10 8 6 4-6 4V8z"/>',
      '</svg>탭해서 영상 선택</div>',
      '<input type="file" id="reelLearnVideoInput" accept="video/*" multiple style="display:none">',
      '<div id="reelLearnVideoList" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;"></div>',

      '<label style="font-size:12px;font-weight:700;display:block;margin:14px 0 6px;">내 캡션 샘플 3개 (예전에 썼던 인스타 글)</label>',
      '<textarea id="reelLearnCaption1" placeholder="예전에 올렸던 인스타 글 그대로 붙여넣기" rows="2" style="width:100%;border-radius:10px;border:1px solid var(--border-strong);padding:10px;font-size:13px;resize:none;margin-bottom:6px;box-sizing:border-box;background:var(--surface-2);color:var(--text);"></textarea>',
      '<textarea id="reelLearnCaption2" placeholder="두 번째 글" rows="2" style="width:100%;border-radius:10px;border:1px solid var(--border-strong);padding:10px;font-size:13px;resize:none;margin-bottom:6px;box-sizing:border-box;background:var(--surface-2);color:var(--text);"></textarea>',
      '<textarea id="reelLearnCaption3" placeholder="세 번째 글" rows="2" style="width:100%;border-radius:10px;border:1px solid var(--border-strong);padding:10px;font-size:13px;resize:none;box-sizing:border-box;background:var(--surface-2);color:var(--text);"></textarea>',

      '<label style="font-size:12px;font-weight:700;display:block;margin:14px 0 6px;">템플릿 이름</label>',
      '<input type="text" id="reelLearnName" value="내 스타일 1" style="width:100%;border-radius:10px;border:1px solid var(--border-strong);padding:10px;font-size:14px;box-sizing:border-box;background:var(--surface-2);color:var(--text);">',

      '<button id="reelLearnSubmitBtn" onclick="window.reelTemplate.submitLearn()" style="',
      'width:100%;margin-top:14px;padding:14px;border-radius:14px;border:none;',
      'background:var(--accent);color:#fff;font-size:15px;font-weight:800;cursor:pointer;">',
      '학습 시작</button>',
      '<div id="reelLearnProgress" style="display:none;text-align:center;margin-top:10px;font-size:13px;color:var(--text-muted);">AI가 내 스타일 배우는 중… (30~60초)</div>',
      '</div>',
    ].join('');
  }

  function startLearn(containerEl) {
    state.isLearning = true;
    var formWrap = (containerEl || document).querySelector('#reelLearnForm') || document.getElementById('reelLearnForm');
    if (!formWrap) return;
    formWrap.style.maxHeight = '600px';

    var input = document.getElementById('reelLearnVideoInput');
    if (input) input.onchange = function (e) { _previewLearnVideos(e.target.files); };

    var dz = document.getElementById('reelLearnDropzone');
    if (dz) {
      dz.ondragover = function (e) { e.preventDefault(); };
      dz.ondrop = function (e) { e.preventDefault(); _previewLearnVideos(e.dataTransfer.files); };
    }
  }

  function _previewLearnVideos(files) {
    var list = document.getElementById('reelLearnVideoList');
    if (!list) return;
    var arr = Array.from(files).slice(0, 3);
    arr.forEach(function (f) {
      var chip = document.createElement('div');
      chip.style.cssText = 'font-size:11px;background:var(--surface-2);border-radius:8px;padding:4px 8px;border:1px solid var(--border-strong);';
      chip.textContent = f.name.slice(0, 18) + (f.name.length > 18 ? '…' : '');
      list.appendChild(chip);
    });
    list._files = arr;
  }

  async function submitLearn() {
    var videoList = document.getElementById('reelLearnVideoList');
    var files = (videoList && videoList._files) || [];
    if (files.length === 0) { _toast('레퍼런스 영상을 1개 이상 올려주세요'); return; }

    var captions = [
      (document.getElementById('reelLearnCaption1') || {}).value || '',
      (document.getElementById('reelLearnCaption2') || {}).value || '',
      (document.getElementById('reelLearnCaption3') || {}).value || '',
    ].filter(function (c) { return c.trim(); });

    var name = (document.getElementById('reelLearnName') || {}).value || '내 스타일 1';

    var submitBtn = document.getElementById('reelLearnSubmitBtn');
    var progress  = document.getElementById('reelLearnProgress');
    if (submitBtn) submitBtn.disabled = true;
    if (progress)  progress.style.display = 'block';

    try {
      // 영상 presigned 업로드 (키프레임 포함)
      var videoUrls = [];
      var keyframeUrlsPerVideo = [];

      for (var i = 0; i < files.length; i++) {
        // TODO: 영상 자체 업로드 presigned URL 연동 (명령서 #4 확정 후)
        console.warn('[reelTemplate] 영상 업로드 presigned 미연동 — 스킵');
        videoUrls.push('placeholder_video_url_' + i);

        if (window.reelKeyframe) {
          var blobs = await window.reelKeyframe.extract(files[i]);
          var kfUrls = await window.reelKeyframe.uploadKeyframes(blobs, 'learn_' + Date.now());
          keyframeUrlsPerVideo.push(kfUrls);
        } else {
          keyframeUrlsPerVideo.push([]);
        }
      }

      var res = await fetch(window.API + '/reel/templates', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, _authHeader()),
        body: JSON.stringify({
          name: name,
          reference_video_urls: videoUrls,
          caption_samples: captions,
          keyframe_urls_per_video: keyframeUrlsPerVideo,
        }),
      });

      if (!res.ok) {
        var err = await res.json().catch(function () { return {}; });
        throw new Error(err.detail || '학습 요청 실패');
      }

      _toast('템플릿 학습이 시작됐어요!');
      state.isLearning = false;
      await init();
    } catch (e) {
      _toast('학습 중 오류: ' + e.message);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (progress)  progress.style.display = 'none';
    }
  }

  async function deleteTemplate(id) {
    try {
      var res = await fetch(window.API + '/reel/templates/' + id, {
        method: 'DELETE',
        headers: _authHeader(),
      });
      if (!res.ok) throw new Error('삭제 실패');
      state.templates = state.templates.filter(function (t) { return t.id !== id; });
      if (state.activeId === id) state.activeId = null;
      _toast('템플릿이 삭제됐어요');
    } catch (e) {
      _toast('삭제 중 오류가 생겼어요');
    }
  }

  function _esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  window.reelTemplate = {
    state:       state,
    init:        init,
    render:      render,
    startLearn:  startLearn,
    submitLearn: submitLearn,
    'delete':    deleteTemplate,
  };
})();
