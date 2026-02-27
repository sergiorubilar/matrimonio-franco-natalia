/* ========================================
   MÚSICA DE FONDO — Perfect (Ed Sheeran)
   Uses YouTube IFrame API to stream audio.
   Tries autoplay on load, falls back to
   first user interaction. Skips guitar intro
   to start at the vocals (second 12).
   ======================================== */

(function () {
  'use strict';

  var player = null;
  var btnToggle = null;
  var playing = false;
  var ready = false;
  var started = false;

  // YouTube video ID — Ed Sheeran - Perfect
  var VIDEO_ID = '2Vv-BfVoq4g';
  var START_SECONDS = 12; // skip guitar intro, start at vocals

  /* ---- Load YouTube IFrame API ---- */
  function loadYTApi() {
    if (window.YT && window.YT.Player) {
      onYTReady();
      return;
    }
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = onYTReady;
  }

  function onYTReady() {
    var holder = document.createElement('div');
    holder.id = 'yt-music-player';
    holder.style.cssText = 'position:fixed;top:-200px;left:-200px;width:1px;height:1px;overflow:hidden;pointer-events:none;';
    document.body.appendChild(holder);

    player = new YT.Player('yt-music-player', {
      videoId: VIDEO_ID,
      playerVars: {
        autoplay: 1,          // attempt autoplay immediately
        controls: 0,
        loop: 1,
        playlist: VIDEO_ID,
        start: START_SECONDS,  // skip guitar intro
        modestbranding: 1,
        rel: 0,
        fs: 0,
        disablekb: 1,
        iv_load_policy: 3
      },
      events: {
        onReady: function () {
          ready = true;
          player.setVolume(40);
          player.seekTo(START_SECONDS, true);
          player.playVideo();
        },
        onStateChange: function (e) {
          // Detect if playback actually started
          if (e.data === YT.PlayerState.PLAYING && !started) {
            started = true;
            playing = true;
            showToggle();
          }
          // Loop: restart at the vocals, not from 0
          if (e.data === YT.PlayerState.ENDED) {
            player.seekTo(START_SECONDS, true);
            player.playVideo();
          }
        }
      }
    });
  }

  function tryPlay() {
    if (started || !ready || !player) return;
    player.seekTo(START_SECONDS, true);
    player.playVideo();
  }

  /* ---- Create the floating toggle button ---- */
  function createToggle() {
    btnToggle = document.createElement('button');
    btnToggle.className = 'music-toggle';
    btnToggle.id = 'music-toggle';
    btnToggle.setAttribute('aria-label', 'Pausar música');
    btnToggle.innerHTML =
      '<svg class="music-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M9 18V5l12-2v13"/>' +
        '<circle cx="6" cy="18" r="3"/>' +
        '<circle cx="18" cy="16" r="3"/>' +
      '</svg>' +
      '<span class="music-toggle__bar"></span>';
    btnToggle.style.display = 'none';
    document.body.appendChild(btnToggle);

    btnToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!player || !ready) return;
      if (playing) {
        player.pauseVideo();
        playing = false;
        btnToggle.classList.add('music-toggle--muted');
        btnToggle.setAttribute('aria-label', 'Reproducir música');
      } else {
        player.playVideo();
        playing = true;
        btnToggle.classList.remove('music-toggle--muted');
        btnToggle.setAttribute('aria-label', 'Pausar música');
      }
    });
  }

  /* ---- Show the toggle with entrance animation ---- */
  function showToggle() {
    if (!btnToggle) return;
    btnToggle.style.display = 'flex';
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(btnToggle,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)', delay: 0.3 }
      );
    }
  }

  /* ---- Init ---- */
  function init() {
    createToggle();
    loadYTApi();

    // Fallback: if autoplay was blocked, start on any user interaction
    function onFirstInteraction() {
      document.removeEventListener('click', onFirstInteraction);
      document.removeEventListener('touchstart', onFirstInteraction);
      tryPlay();
    }
    document.addEventListener('click', onFirstInteraction);
    document.addEventListener('touchstart', onFirstInteraction);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
