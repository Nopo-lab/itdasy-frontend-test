/* app-reel-caption.js — 릴스 캡션·해시태그 인라인 편집 */
/* window.reelCaption — app-caption.js(기존)와 완전히 별개 네임스페이스 */
(function () {
  'use strict';

  var _container = null;
  var _generation = null;
  var _textEl = null;
  var _tagsEl = null;
  var _tags = [];

  function _toast(msg) {
    if (typeof showToast === 'function') showToast(msg);
    else console.warn('[reelCaption]', msg);
  }

  function _autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  function bind(containerEl, generation) {
    _container  = containerEl;
    _generation = generation;
    _tags       = (generation.hashtags || []).slice();

    containerEl.innerHTML = '';

    // ── 본문 textarea ────────────────────────────────────────
    var textWrap = document.createElement('div');
    textWrap.style.cssText = 'margin-bottom:12px;';

    var textLabel = document.createElement('div');
    textLabel.style.cssText = 'font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;';
    textLabel.innerHTML = '<span>캡션</span><span id="reelCaptionCount" style="font-size:11px;">0자</span>';

    _textEl = document.createElement('textarea');
    _textEl.value = generation.caption_text || '';
    _textEl.rows = 8;
    _textEl.style.cssText = [
      'width:100%;box-sizing:border-box;resize:none;',
      'border-radius:14px;border:1px solid var(--border-strong);',
      'padding:12px;font-size:14px;line-height:1.6;',
      'background:var(--surface-2);color:var(--text);',
    ].join('');
    _textEl.addEventListener('input', function () {
      _autoResize(_textEl);
      var countEl = document.getElementById('reelCaptionCount');
      if (countEl) countEl.textContent = _textEl.value.length + '자';
    });

    textWrap.appendChild(textLabel);
    textWrap.appendChild(_textEl);
    containerEl.appendChild(textWrap);

    // 초기 자수 표시
    setTimeout(function () {
      _autoResize(_textEl);
      var countEl = document.getElementById('reelCaptionCount');
      if (countEl) countEl.textContent = _textEl.value.length + '자';
    }, 0);

    // ── 해시태그 칩 ──────────────────────────────────────────
    var tagSection = document.createElement('div');
    tagSection.style.cssText = 'margin-bottom:14px;';

    var tagLabel = document.createElement('div');
    tagLabel.style.cssText = 'font-size:12px;font-weight:700;color:var(--text-muted);margin-bottom:8px;display:flex;justify-content:space-between;';
    tagLabel.innerHTML = '<span>해시태그</span><span id="reelTagCount" style="font-size:11px;">' + _tags.length + '개 (권장 5~15개)</span>';

    _tagsEl = document.createElement('div');
    _tagsEl.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';

    _renderTags();

    // 태그 추가 입력
    var addRow = document.createElement('div');
    addRow.style.cssText = 'display:flex;gap:6px;margin-top:8px;';

    var tagInput = document.createElement('input');
    tagInput.type = 'text';
    tagInput.placeholder = '#해시태그 추가';
    tagInput.style.cssText = [
      'flex:1;border-radius:10px;border:1px solid var(--border-strong);',
      'padding:8px 12px;font-size:13px;background:var(--surface-2);color:var(--text);',
    ].join('');
    tagInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); _addTag(tagInput.value); tagInput.value = ''; }
    });

    var addBtn = document.createElement('button');
    addBtn.textContent = '추가';
    addBtn.style.cssText = [
      'padding:8px 14px;border-radius:10px;border:none;',
      'background:var(--accent);color:#fff;font-size:13px;font-weight:700;cursor:pointer;',
    ].join('');
    addBtn.onclick = function () { _addTag(tagInput.value); tagInput.value = ''; };

    addRow.appendChild(tagInput);
    addRow.appendChild(addBtn);

    tagSection.appendChild(tagLabel);
    tagSection.appendChild(_tagsEl);
    tagSection.appendChild(addRow);
    containerEl.appendChild(tagSection);

    // ── 복사 버튼 ─────────────────────────────────────────────
    var copyBtn = document.createElement('button');
    copyBtn.textContent = '캡션 + 해시태그 복사';
    copyBtn.style.cssText = [
      'width:100%;padding:14px;border-radius:14px;border:none;',
      'background:var(--surface-2);color:var(--text);font-size:14px;font-weight:800;cursor:pointer;',
      'transition:transform .15s;',
    ].join('');
    copyBtn.addEventListener('pointerdown', function () { copyBtn.style.transform = 'scale(.97)'; });
    copyBtn.addEventListener('pointerup',   function () { copyBtn.style.transform = ''; });
    copyBtn.addEventListener('pointerleave',function () { copyBtn.style.transform = ''; });
    copyBtn.onclick = function () { save(); };
    containerEl.appendChild(copyBtn);
  }

  function _renderTags() {
    if (!_tagsEl) return;
    _tagsEl.innerHTML = '';
    _tags.forEach(function (tag, idx) {
      var chip = document.createElement('span');
      chip.style.cssText = [
        'display:inline-flex;align-items:center;gap:4px;',
        'background:var(--surface-2);border:1px solid var(--border-strong);',
        'border-radius:999px;padding:4px 10px;font-size:12px;cursor:pointer;',
        'transition:background .15s,opacity .15s;',
      ].join('');
      chip.innerHTML = '#' + _esc(tag) + ' <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      chip.onclick = function () {
        chip.style.opacity = '0';
        setTimeout(function () {
          _tags.splice(idx, 1);
          _renderTags();
          _updateTagCount();
        }, 150);
      };
      _tagsEl.appendChild(chip);
    });
    _updateTagCount();
  }

  function _addTag(raw) {
    if (!raw || !raw.trim()) return;
    var tag = raw.trim().replace(/^#+/, '');
    if (!tag) return;
    if (_tags.indexOf(tag) === -1) _tags.push(tag);
    _renderTags();
  }

  function _updateTagCount() {
    var el = document.getElementById('reelTagCount');
    if (el) el.textContent = _tags.length + '개 (권장 5~15개)';
  }

  function save() {
    // v1: 클립보드 복사만. v1.5에서 BE PATCH 저장 추가.
    var text = (_textEl ? _textEl.value : '') + '\n\n' + _tags.map(function (t) { return '#' + t; }).join(' ');
    navigator.clipboard.writeText(text).then(function () {
      if (typeof hapticSuccess === 'function') hapticSuccess();
      if (typeof showToast === 'function') showToast('클립보드에 복사됐어요! 인스타에 바로 붙여넣기 하세요');
    }).catch(function () {
      if (typeof showToast === 'function') showToast('복사 실패 — 직접 선택해서 복사해주세요');
    });
  }

  function _esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  window.reelCaption = { bind: bind, save: save };
})();
