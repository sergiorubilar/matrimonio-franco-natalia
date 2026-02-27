/* ========================================
   MÚSICA DE FONDO — Perfect (Ed Sheeran)
   Uses YouTube IFrame API to stream audio.

   Strategy: start MUTED with autoplay (allowed
   by all browsers), then unmute on first user
   gesture (intro tap). This eliminates loading
   delay — music plays instantly on tap.
   ======================================== */

(function () {
  'use strict';

  var player = null;
  var btnToggle = null;
  var playing = false;
  var ready = false;
  var started = false;
  var mutedAutoplay = false; // true if playing muted, waiting for gesture

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
        autoplay: 1,
        mute: 1,             // start muted — guaranteed autoplay on all browsers
        controls: 0,
        loop: 1,
        playlist: VIDEO_ID,
        start: START_SECONDS,
        modestbranding: 1,
        rel: 0,
        fs: 0,
        disablekb: 1,
        iv_load_policy: 3
      },
      events: {
        onReady: function () {
          ready = true;
          player.seekTo(START_SECONDS, true);
          player.playVideo();

          // Immediately try to unmute (works on desktop)
          setTimeout(function () {
            if (!started) {
              player.unMute();
              player.setVolume(40);
            }
          }, 500);
        },
        onStateChange: function (e) {
          if (e.data === YT.PlayerState.PLAYING) {
            if (!started && player.isMuted()) {
              // Playing muted — autoplay worked, waiting for unmute
              mutedAutoplay = true;
              // Try to unmute again (aggressive desktop attempt)
              player.unMute();
              player.setVolume(40);
            }
            if (!started && !player.isMuted()) {
              // Playing with sound!
              started = true;
              playing = true;
              mutedAutoplay = false;
              btnToggle.classList.remove('music-toggle--muted');
              btnToggle.setAttribute('aria-label', 'Pausar música');
            }
          }
          if (e.data === YT.PlayerState.ENDED) {
            player.seekTo(START_SECONDS, true);
            player.playVideo();
          }
        }
      }
    });
  }

  /* ---- Unmute on user gesture (mobile) ---- */
  function unmuteAndPlay() {
    if (started) return;
    if (!ready || !player) {
      // Player not ready yet — poll until ready then unmute
      var check = setInterval(function () {
        if (ready && player) {
          clearInterval(check);
          doUnmute();
        }
      }, 200);
      return;
    }
    doUnmute();
  }

  function doUnmute() {
    if (started) return;
    started = true;
    playing = true;
    mutedAutoplay = false;

    player.unMute();
    player.setVolume(40);

    // If the player stalled or isn't playing, force play
    if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
      player.seekTo(START_SECONDS, true);
      player.playVideo();
    }

    btnToggle.classList.remove('music-toggle--muted');
    btnToggle.setAttribute('aria-label', 'Pausar música');
  }

  /* ---- Also try unmuted autoplay on desktop ---- */
  function tryUnmutedAutoplay() {
    if (!ready || !player || started) return;
    // Attempt to unmute — if browser allows, great; if not, stays muted
    player.unMute();
    player.setVolume(40);
    player.playVideo();
  }

  /* ---- Create the floating toggle button ---- */
  function createToggle() {
    btnToggle = document.createElement('button');
    btnToggle.className = 'music-toggle music-toggle--muted';
    btnToggle.id = 'music-toggle';
    btnToggle.setAttribute('aria-label', 'Reproducir música');
    btnToggle.innerHTML =
      '<svg class="music-toggle__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M9 18V5l12-2v13"/>' +
        '<circle cx="6" cy="18" r="3"/>' +
        '<circle cx="18" cy="16" r="3"/>' +
      '</svg>' +
      '<span class="music-toggle__bar"></span>';
    document.body.appendChild(btnToggle);

    // Entrance animation
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(btnToggle,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)', delay: 0.8 }
      );
    }

    btnToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!player || !ready) return;

      // First click while muted-autoplay → unmute
      if (mutedAutoplay && !started) {
        doUnmute();
        return;
      }

      if (playing) {
        player.pauseVideo();
        playing = false;
        btnToggle.classList.add('music-toggle--muted');
        btnToggle.setAttribute('aria-label', 'Reproducir música');
      } else {
        player.unMute();
        player.setVolume(40);
        player.playVideo();
        playing = true;
        btnToggle.classList.remove('music-toggle--muted');
        btnToggle.setAttribute('aria-label', 'Pausar música');
      }
    });
  }

  /* ---- Init ---- */
  function init() {
    createToggle();
    loadYTApi();

    // On first user gesture: unmute the muted-autoplay stream
    // Use capture phase to catch events even if stopPropagation is called
    function onFirstInteraction() {
      document.removeEventListener('click', onFirstInteraction, true);
      document.removeEventListener('touchstart', onFirstInteraction, true);
      // Small delay to let YouTube process the user gesture context
      setTimeout(unmuteAndPlay, 50);
    }
    document.addEventListener('click', onFirstInteraction, true);
    document.addEventListener('touchstart', onFirstInteraction, true);

    // On desktop, aggressively try unmuted autoplay at multiple intervals
    [1000, 2000, 3000, 5000].forEach(function (delay) {
      setTimeout(tryUnmutedAutoplay, delay);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
