/* app-reel-keyframe.js — 브라우저 키프레임 추출 + S3 업로드 유틸 */
(function () {
  'use strict';

  var MAX_WIDTH = 1080;
  var SEEK_TIMEOUT_MS = 3000;
  var JPEG_QUALITY = 0.85;

  var CT_MAP = { mp4: 'video/mp4', mov: 'video/quicktime', jpg: 'image/jpeg', jpeg: 'image/jpeg' };

  function _ah() {
    var t = typeof getToken === 'function' ? getToken() : null;
    return t ? { 'Authorization': 'Bearer ' + t, 'ngrok-skip-browser-warning': 'true' } : {};
  }

  function _seekFrame(video, pos) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        reject(new Error('키프레임 추출 시간 초과 (영상이 손상됐거나 너무 큰 파일이에요)'));
      }, SEEK_TIMEOUT_MS);
      video.onseeked = function () {
        clearTimeout(timer);
        var w = video.videoWidth, h = video.videoHeight;
        var scale = w > MAX_WIDTH ? MAX_WIDTH / w : 1;
        var cw = Math.round(w * scale), ch = Math.round(h * scale);
        var canvas = document.createElement('canvas');
        canvas.width = cw; canvas.height = ch;
        canvas.getContext('2d').drawImage(video, 0, 0, cw, ch);
        canvas.toBlob(function (blob) {
          if (!blob) { reject(new Error('캔버스 이미지 변환에 실패했어요')); return; }
          resolve(blob);
        }, 'image/jpeg', JPEG_QUALITY);
      };
      video.currentTime = pos;
    });
  }

  async function extract(videoFile, positions) {
    positions = positions || [0.0, 0.5, 0.95];
    var url = URL.createObjectURL(videoFile);
    var video = document.createElement('video');
    video.muted = true; video.playsInline = true; video.preload = 'metadata';
    try {
      await new Promise(function (resolve, reject) {
        var timer = setTimeout(function () { reject(new Error('영상 메타 로딩 실패 (재생 불가능한 파일이에요)')); }, SEEK_TIMEOUT_MS);
        video.onloadedmetadata = function () {
          clearTimeout(timer);
          if (!video.duration) { reject(new Error('재생 시간이 0초인 영상이에요')); return; }
          resolve();
        };
        video.onerror = function () { clearTimeout(timer); reject(new Error('영상 파일을 읽을 수 없어요 (지원하지 않는 형식일 수 있어요)')); };
        video.src = url;
      });
      var blobs = [];
      for (var i = 0; i < positions.length; i++) {
        blobs.push(await _seekFrame(video, Math.min(positions[i], 0.999) * video.duration));
      }
      return blobs;
    } finally {
      URL.revokeObjectURL(url); video.src = '';
    }
  }

  // ── 공용 업로드 헬퍼 ─────────────────────────────────────────
  // asset_type: 'source_video' | 'reference_video'
  // ext: 'mp4' | 'mov' | 'jpg'
  async function presigned(assetType, ext) {
    var res = await fetch(window.API + '/reel/uploads/presigned', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, _ah()),
      body: JSON.stringify({ asset_type: assetType, ext: ext }),
    });
    if (res.status === 401) throw new Error('AUTH_401');
    if (!res.ok) throw new Error('업로드 URL 발급 실패 (' + res.status + ')');
    return res.json(); // { url, s3_key }
  }

  async function putToS3(url, data, contentType) {
    var res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': contentType }, body: data });
    if (!res.ok) throw new Error('S3 업로드 실패 (' + res.status + ')');
  }

  // blobs: Blob[] — assetType defaults to 'source_video'
  // returns: s3_key[]
  async function uploadKeyframes(blobs, assetType) {
    assetType = assetType || 'source_video';
    var keys = [];
    for (var i = 0; i < blobs.length; i++) {
      var p = await presigned(assetType, 'jpg');
      await putToS3(p.url, blobs[i], 'image/jpeg');
      keys.push(p.s3_key);
    }
    return keys;
  }

  function fileExt(name) {
    var parts = (name || '').split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'mp4';
  }

  function contentType(ext) {
    return CT_MAP[ext] || 'application/octet-stream';
  }

  window.reelKeyframe = { extract: extract, uploadKeyframes: uploadKeyframes, presigned: presigned, putToS3: putToS3, fileExt: fileExt, contentType: contentType };
})();
