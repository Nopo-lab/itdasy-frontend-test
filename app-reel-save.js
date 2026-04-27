/* app-reel-save.js — 릴스 결과 영상 갤러리 저장 */
(function () {
  'use strict';

  function _toast(msg) {
    if (typeof showToast === 'function') showToast(msg); else console.warn('[reelSave]', msg);
  }

  async function saveToGallery(videoUrl) {
    if (!videoUrl) { _toast('저장할 영상이 없어요'); return; }

    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
      try {
        var plugins = window.Capacitor.Plugins || {};
        var Filesystem = plugins.Filesystem;
        var Media = plugins.Media;

        if (!Filesystem || !Media) throw new Error('플러그인 미설치 — 앱을 최신 버전으로 업데이트해주세요');

        _toast('저장 중…');
        var blob = await (await fetch(videoUrl)).blob();
        var base64 = await new Promise(function (resolve) {
          var r = new FileReader();
          r.onload = function () { resolve(r.result.split(',')[1]); };
          r.readAsDataURL(blob);
        });

        var written = await Filesystem.writeFile({
          path: 'itdasy-reel-' + Date.now() + '.mp4',
          data: base64,
          directory: 'CACHE',
        });

        // @capacitor-community/media v6: saveVideo for MP4 files
        var saveFn = typeof Media.saveVideo === 'function' ? Media.saveVideo : Media.savePhoto;
        await saveFn({ path: written.uri, album: '잇데이' });

        typeof hapticSuccess === 'function' && hapticSuccess();
        _toast('사진 앱에 저장됐어요 🎉');
      } catch (e) {
        console.warn('[reelSave] native error', e);
        var msg = (e.message || '').toLowerCase().indexOf('denied') !== -1
          ? '사진 앱 접근 권한을 허용해주세요 (설정 → 잇데이 → 사진)'
          : '저장 실패: ' + (e.message || '알 수 없는 오류');
        _toast(msg);
      }
    } else {
      var a = document.createElement('a');
      a.href = videoUrl;
      a.download = 'itdasy-reel-' + Date.now() + '.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      _toast('다운로드 폴더에 저장됐어요');
    }
  }

  window.reelSave = { saveToGallery: saveToGallery };
})();
