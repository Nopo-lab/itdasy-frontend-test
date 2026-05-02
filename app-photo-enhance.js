// Itdasy Studio - 시술 사진 디테일 보정

const _ENHANCE_DEFAULTS = {
  cleanup: 0,
  color: 0,
  smooth: 0,
  red: 0,
};

function _enhanceShopType() {
  return (localStorage.getItem('shop_type') || '').toLowerCase();
}

function _enhanceVisibleKeys() {
  const type = _enhanceShopType();
  const hair = ['붙임머리', 'extension', 'hair', '헤어', '헤어샵'].some(x => type.includes(x.toLowerCase()));
  const lash = ['속눈썹', 'lash'].some(x => type.includes(x.toLowerCase()));
  const semi = ['반영구', 'tattoo'].some(x => type.includes(x.toLowerCase()));
  const nail = ['네일', 'nail'].some(x => type.includes(x.toLowerCase()));
  if (hair) return ['cleanup', 'color', 'smooth'];
  if (lash) return ['cleanup', 'smooth', 'red'];
  if (semi) return ['color', 'red'];
  if (nail) return ['color'];
  return ['color'];
}

function openEnhancePanel() {
  const panel = document.getElementById('enhancePanel');
  if (!panel) return;
  panel.classList.add('ws-panel--open');
  _renderEnhancePanel();
}

function closeEnhancePanel() {
  document.getElementById('enhancePanel')?.classList.remove('ws-panel--open');
}

function _enhanceRow(key, label, hint) {
  return `
    <label data-enhance-row="${key}" style="display:block;margin-bottom:14px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;">
        <span style="font-size:13px;font-weight:800;color:var(--text);">${label}</span>
        <span data-enhance-val="${key}" style="font-size:11px;color:var(--text3);">0</span>
      </div>
      <input data-enhance="${key}" type="range" min="0" max="100" value="${_ENHANCE_DEFAULTS[key]}" style="width:100%;">
      <div style="font-size:11px;color:var(--text3);line-height:1.45;margin-top:3px;">${hint}</div>
    </label>
  `;
}

function _renderEnhancePanel() {
  const body = document.getElementById('enhancePanelBody');
  if (!body) return;
  const visible = new Set(_enhanceVisibleKeys());
  body.innerHTML = `
    <div style="font-size:12px;color:var(--text3);line-height:1.55;margin-bottom:14px;">
      선택한 사진에만 적용돼요. 사진을 고른 뒤 아래 값을 조절하세요.
    </div>
    ${_enhanceRow('cleanup', '잔머리 정리', '사진 가장자리를 살짝 정돈해 더 깔끔하게 보여줘요.')}
    ${_enhanceRow('color', '색 균일화', '얼룩진 색감을 부드럽게 맞춰요.')}
    ${_enhanceRow('smooth', '결 부드럽게', '머릿결·속눈썹 결을 살짝 매끈하게 보여줘요.')}
    ${_enhanceRow('red', '충혈 제거', '밝은 붉은 부분을 자연스럽게 낮춰요.')}
    <button type="button" onclick="applyEnhanceToSelected()" class="btn-primary" style="width:100%;margin-top:6px;">보정 적용</button>
  `;
  body.querySelectorAll('[data-enhance-row]').forEach(row => {
    row.style.display = visible.has(row.dataset.enhanceRow) ? 'block' : 'none';
  });
  body.querySelectorAll('[data-enhance]').forEach(input => {
    input.addEventListener('input', () => {
      body.querySelector(`[data-enhance-val="${input.dataset.enhance}"]`).textContent = input.value;
    });
  });
}

function _enhanceSettings() {
  const panel = document.getElementById('enhancePanel');
  const out = { ..._ENHANCE_DEFAULTS };
  Object.keys(out).forEach(key => {
    const input = panel?.querySelector(`[data-enhance="${key}"]`);
    out[key] = Math.max(0, Math.min(100, parseInt(input?.value || '0', 10))) / 100;
  });
  return out;
}

function _loadEnhanceImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function _drawEnhanceBase(img) {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  canvas.getContext('2d').drawImage(img, 0, 0);
  return canvas;
}

function _applyColorPixels(data, opt) {
  const color = opt.color || 0;
  const red = opt.red || 0;
  const cleanup = opt.cleanup || 0;
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i], g = data[i + 1], b = data[i + 2];
    const avg = (r + g + b) / 3;
    r += (avg - r) * color * 0.28;
    g += (avg - g) * color * 0.28;
    b += (avg - b) * color * 0.28;
    const bright = avg > 130;
    if (bright && r > g + 18 && r > b + 18) {
      r -= (r - Math.max(g, b)) * red * 0.75;
      g += (255 - g) * red * 0.08;
      b += (255 - b) * red * 0.08;
    }
    const contrast = 1 + cleanup * 0.08;
    data[i] = Math.max(0, Math.min(255, (r - 128) * contrast + 128));
    data[i + 1] = Math.max(0, Math.min(255, (g - 128) * contrast + 128));
    data[i + 2] = Math.max(0, Math.min(255, (b - 128) * contrast + 128));
  }
}

function _blendSmooth(canvas, amount) {
  if (!amount) return;
  const ctx = canvas.getContext('2d');
  const original = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const tmp = document.createElement('canvas');
  tmp.width = canvas.width; tmp.height = canvas.height;
  const tctx = tmp.getContext('2d');
  tctx.filter = `blur(${Math.max(0.4, amount * 2.2)}px)`;
  tctx.drawImage(canvas, 0, 0);
  const blur = tctx.getImageData(0, 0, canvas.width, canvas.height);
  const mix = Math.min(0.38, amount * 0.38);
  for (let i = 0; i < original.data.length; i += 4) {
    original.data[i] += (blur.data[i] - original.data[i]) * mix;
    original.data[i + 1] += (blur.data[i + 1] - original.data[i + 1]) * mix;
    original.data[i + 2] += (blur.data[i + 2] - original.data[i + 2]) * mix;
  }
  ctx.putImageData(original, 0, 0);
}

async function _enhanceOnePhoto(photo, opt) {
  const img = await _loadEnhanceImage(photo.editedDataUrl || photo.dataUrl);
  const canvas = _drawEnhanceBase(img);
  const ctx = canvas.getContext('2d');
  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  _applyColorPixels(frame.data, opt);
  ctx.putImageData(frame, 0, 0);
  _blendSmooth(canvas, opt.smooth);
  photo.beforeEnhanceDataUrl = photo.editedDataUrl || photo.dataUrl;
  photo.editedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
  photo.mode = 'enhanced';
}

async function applyEnhanceToSelected() {
  const slot = _slots.find(s => s.id === _popupSlotId);
  if (!slot) return;
  const selected = slot.photos.filter(p => _popupSelIds.has(p.id) && !p.hidden);
  if (!selected.length) { showToast('먼저 사진을 선택해주세요'); return; }
  const progress = document.getElementById('popupProgress');
  if (progress) { progress.style.display = 'block'; progress.textContent = '보정 중...'; }
  try {
    const opt = _enhanceSettings();
    for (let i = 0; i < selected.length; i++) {
      if (progress) progress.textContent = `보정 중... ${i + 1}/${selected.length}`;
      await _enhanceOnePhoto(selected[i], opt);
    }
    await saveSlotToDB(slot);
    _popupSelIds.clear();
    _renderPopupPhotoGrid(slot);
    closeEnhancePanel();
    showToast(`${selected.length}장 보정 완료`);
  } catch (e) {
    console.warn('사진 보정 실패:', e);
    showToast('보정 실패');
  } finally {
    if (progress) progress.style.display = 'none';
  }
}
