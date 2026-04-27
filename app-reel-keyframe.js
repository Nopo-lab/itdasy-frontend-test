/* app-reel-keyframe.js — 브라우저 키프레임 추출 + S3 업로드 */
(function () {
  'use strict';

  const MAX_WIDTH = 1080;
  const SEEK_TIMEOUT_MS = 3000;
  const JPEG_QUALITY = 0.85;

  function _seekFrame(video, pos) {
    return new Promise(function (resolve, reject) {
      var timer = setTimeout(function () {
        reject(new Error('키프레임 추출 시간 초과 (영상이 손상됐거나 너무 큰 파일이에요)'));
      }, SEEK_TIMEOUT_MS);

      video.onseeked = function () {
        clearTimeout(timer);
        var w = video.videoWidth;
        var h = video.videoHeight;
        var scale = w > MAX_WIDTH ? MAX_WIDTH / w : 1;
        var cw = Math.round(w * scale);
        var ch = Math.round(h * scale);
        var canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, cw, ch);
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
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    try {
      await new Promise(function (resolve, reject) {
        var timer = setTimeout(function () {
          reject(new Error('영상 메타 로딩 실패 (재생 불가능한 파일이에요)'));
        }, SEEK_TIMEOUT_MS);
        video.onloadedmetadata = function () {
          clearTimeout(timer);
          if (!video.duration || video.duration === 0) {
            reject(new Error('재생 시간이 0초인 영상이에요'));
            return;
          }
          resolve();
        };
        video.onerror = function () {
          clearTimeout(timer);
          reject(new Error('영상 파일을 읽을 수 없어요 (지원하지 않는 형식일 수 있어요)'));
        };
        video.src = url;
      });

      var blobs = [];
      for (var i = 0; i < positions.length; i++) {
        var t = Math.min(positions[i], 0.999) * video.duration;
        blobs.push(await _seekFrame(video, t));
      }
      return blobs;
    } finally {
      URL.revokeObjectURL(url);
      video.src = '';
    }
  }

  async function uploadKeyframes(blobs, generationId) {
    // TODO: BE /reel/uploads/presigned 스펙 확정 후 실 연동 (명령서 #4 산출물 확인 필요)
    // 현재 presigned URL 엔드포인트 미확정 — placeholder 구현
    console.warn('[reelKeyframe] uploadKeyframes: BE presigned URL 엔드포인트 미연동');
    var urls = [];
    for (var i = 0; i < blobs.length; i++) {
      var res = await fetch(window.API + '/reel/uploads/presigned', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, _authHeader()),
        body: JSON.stringify({ generation_id: generationId, index: i, content_type: 'image/jpeg' }),
      });
      if (!res.ok) throw new Error('키프레임 업로드 URL 발급 실패');
      var data = await res.json();
      await fetch(data.upload_url, { method: 'PUT', body: blobs[i], headers: { 'Content-Type': 'image/jpeg' } });
      urls.push(data.public_url);
    }
    return urls;
  }

  function _authHeader() {
    var t = typeof getToken === 'function' ? getToken() : null;
    return t ? { 'Authorization': 'Bearer ' + t } : {};
  }

  window.reelKeyframe = { extract: extract, uploadKeyframes: uploadKeyframes };
})();
