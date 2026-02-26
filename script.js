/* ========================================
   WEDDING LANDING PAGE — Natalia & Franco
   ======================================== */

(function () {
  'use strict';

  // ============================
  // CONFIGURACIÓN
  // ============================
  // Pega aquí la URL de tu Google Apps Script desplegado
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyYSHCf-zHTPKuvnms_6e_miHZzn3lAAZIp1wtHepb0kUAeImIzTS-9ZOlUnVqOLmXr/exec';

  // ============================
  // TOKEN DEL INVITADO
  // ============================
  var urlParams = new URLSearchParams(window.location.search);
  var guestToken = urlParams.get('token');
  var guestInfo = null;

  function isConfigured() {
    return APPS_SCRIPT_URL !== 'PEGAR_URL_DEL_APPS_SCRIPT_AQUI';
  }

  // ============================
  // INTRO ANIMATION (GSAP)
  // ============================
  function initIntro() {
    var intro = document.getElementById('intro');
    var canvas = document.getElementById('intro-canvas');
    var tap = document.getElementById('intro-tap');
    var bloom = intro && intro.querySelector('.intro__bloom');
    var flash = intro && intro.querySelector('.intro__flash');
    var subtitle = document.getElementById('intro-text');
    var name1 = document.getElementById('intro-name1');
    var name2 = document.getElementById('intro-name2');
    var amp = intro && intro.querySelector('.intro__amp');
    var dateEl = intro && intro.querySelector('.intro__date');
    var leak1 = intro && intro.querySelector('.intro__leak--1');
    var leak2 = intro && intro.querySelector('.intro__leak--2');

    if (!intro || !canvas || typeof gsap === 'undefined') return;

    // ============================
    // CANVAS BOKEH PARTICLE SYSTEM
    // ============================
    var ctx = canvas.getContext('2d');
    var bokehParticles = [];
    var bokehAlpha = { value: 0 };
    var bokehRunning = true;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create bokeh particles
    for (var i = 0; i < 40; i++) {
      bokehParticles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 3 + Math.random() * 18,
        alpha: 0.05 + Math.random() * 0.2,
        drift: 0.15 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.006
      });
    }

    function drawBokeh(time) {
      if (!bokehRunning) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < bokehParticles.length; i++) {
        var p = bokehParticles[i];
        var xOff = Math.sin(time * p.speed + p.phase) * 40 * p.drift;
        var yOff = Math.cos(time * p.speed * 0.7 + p.phase) * 25 * p.drift;
        var cx = p.x + xOff;
        var cy = p.y + yOff;

        var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, p.r);
        grad.addColorStop(0, 'rgba(210,185,140,' + (p.alpha * bokehAlpha.value).toFixed(3) + ')');
        grad.addColorStop(0.5, 'rgba(191,168,128,' + (p.alpha * 0.5 * bokehAlpha.value).toFixed(3) + ')');
        grad.addColorStop(1, 'rgba(191,168,128,0)');

        ctx.beginPath();
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      requestAnimationFrame(drawBokeh);
    }
    requestAnimationFrame(drawBokeh);

    // ============================
    // TEXT SPLITTING INTO CHARS
    // ============================
    function splitTextIntoChars(el) {
      if (!el) return [];
      var html = el.innerHTML;
      var parts = html.split(/<br\s*\/?>/i);
      el.innerHTML = '';
      var chars = [];

      for (var p = 0; p < parts.length; p++) {
        if (p > 0) el.appendChild(document.createElement('br'));
        var text = parts[p];
        for (var c = 0; c < text.length; c++) {
          var span = document.createElement('span');
          span.className = 'intro__char';
          span.textContent = text[c] === ' ' ? '\u00A0' : text[c];
          el.appendChild(span);
          chars.push(span);
        }
      }
      return chars;
    }

    var subtitleChars = splitTextIntoChars(subtitle);

    // Show subtitle parent (chars control their own opacity)
    if (subtitle) subtitle.style.opacity = '1';
    // Names animate as whole words (cursive font swashes clip with per-char splitting)

    // ============================
    // GSAP ENTRANCE TIMELINE
    // ============================
    var entranceTL = gsap.timeline({ delay: 0.3 });

    entranceTL
      // Bloom expands
      .to(bloom, {
        scale: 1,
        opacity: 1,
        duration: 3,
        ease: 'power2.out'
      }, 0)

      // Bokeh fades in
      .to(bokehAlpha, {
        value: 1,
        duration: 2.5,
        ease: 'power1.inOut'
      }, 0.3)

      // Light leaks appear
      .to(leak1, { opacity: 1, duration: 2, ease: 'power1.inOut' }, 0.8)
      .to(leak2, { opacity: 1, duration: 2, ease: 'power1.inOut' }, 1.2)

      // Subtitle chars reveal (blur to sharp, staggered)
      .fromTo(subtitleChars, {
        opacity: 0,
        filter: 'blur(8px)',
        y: 10
      }, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 0.6,
        stagger: 0.025,
        ease: 'power2.out'
      }, 1.5)

      // Name 1 reveal (whole word — preserves cursive swashes)
      .fromTo(name1, {
        opacity: 0,
        y: 25,
        filter: 'blur(6px)'
      }, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power3.out'
      }, 2.8)

      // Ampersand
      .to(amp, {
        opacity: 1,
        duration: 0.8,
        ease: 'power1.inOut'
      }, 3.6)

      // Name 2 reveal (whole word)
      .fromTo(name2, {
        opacity: 0,
        y: 25,
        filter: 'blur(6px)'
      }, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1.2,
        ease: 'power3.out'
      }, 3.8)

      // Date reveal
      .fromTo(dateEl, {
        opacity: 0,
        y: 10,
        filter: 'blur(4px)'
      }, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 1,
        ease: 'power2.out'
      }, 4.6)

      // Tap prompt
      .to(tap, {
        opacity: 1,
        duration: 1.5,
        ease: 'power1.inOut'
      }, 5.2);

    // Gold shimmer on names (whole elements)
    [name1, name2].forEach(function (el, i) {
      if (!el) return;
      gsap.to(el, {
        backgroundPosition: '-300% center',
        duration: 4,
        ease: 'none',
        repeat: -1,
        delay: 3.5 + i * 0.5
      });
    });

    // Tap prompt gentle pulse
    gsap.to(tap, {
      opacity: 0.3,
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      delay: 6.5
    });

    // ============================
    // CLICK TO EXIT
    // ============================
    var exiting = false;
    intro.addEventListener('click', function () {
      if (exiting || (!entranceTL.isActive() && entranceTL.progress() < 0.6)) return;
      exiting = true;

      gsap.killTweensOf(tap);
      gsap.killTweensOf(name1);
      gsap.killTweensOf(name2);

      var exitTL = gsap.timeline();

      exitTL
        // Tap text vanishes
        .to(tap, { opacity: 0, duration: 0.3 }, 0)

        // Text dissolves upward with blur
        .to(subtitleChars, {
          opacity: 0,
          y: -20,
          filter: 'blur(6px)',
          duration: 0.5,
          stagger: 0.01,
          ease: 'power2.in'
        }, 0)

        .to(name1, {
          opacity: 0,
          y: -25,
          filter: 'blur(6px)',
          duration: 0.5,
          ease: 'power2.in'
        }, 0.1)

        .to(amp, { opacity: 0, duration: 0.3 }, 0.1)

        .to(name2, {
          opacity: 0,
          y: -25,
          filter: 'blur(6px)',
          duration: 0.5,
          ease: 'power2.in'
        }, 0.15)

        .to(dateEl, {
          opacity: 0,
          y: -15,
          duration: 0.4,
          ease: 'power2.in'
        }, 0.2)

        // Bokeh fades
        .to(bokehAlpha, {
          value: 0,
          duration: 0.8,
          ease: 'power1.in'
        }, 0.3)

        // Bloom shrinks
        .to(bloom, {
          scale: 1.5,
          opacity: 0,
          duration: 1,
          ease: 'power2.in'
        }, 0.3)

        // Light leaks fade
        .to([leak1, leak2], { opacity: 0, duration: 0.6 }, 0.4)

        // Flash to cream
        .to(flash, {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.in'
        }, 0.8)

        // Remove intro
        .add(function () {
          bokehRunning = false;
          window.removeEventListener('resize', resizeCanvas);
          intro.remove();
        }, 1.6);
    });
  }

  // ============================
  // PERSONALIZACIÓN & ARRANQUE
  // ============================
  function personalizeContent() {
    if (!guestInfo) return;

    // Personalizar texto del intro
    var introTextEl = document.getElementById('intro-text');
    if (introTextEl && guestInfo.invitado) {
      var firstName = guestInfo.invitado.split(' ')[0];
      var companion = guestInfo.acompanante || '';

      if (companion && companion.toLowerCase() !== 'pareja' && companion.trim() !== '') {
        var companionFirst = companion.split(' ')[0];
        introTextEl.innerHTML = 'Esta es una invitación<br>exclusiva para ustedes<br>' + firstName + ' y ' + companionFirst;
      } else {
        introTextEl.innerHTML = 'Esta es una invitación<br>exclusiva para ti ' + firstName;
      }
    }

    // Personalizar título del formulario
    var titleEl = document.querySelector('#screen-confirmar .fullscreen__title');
    if (titleEl && guestInfo.invitado) {
      titleEl.innerHTML = guestInfo.invitado.split(' ')[0] + ',<br>confirma tu<br>asistencia';
    }

    // Si ya confirmó, mostrar estado en vez del formulario
    if (guestInfo.confirmacion === 'TRUE' || guestInfo.confirmacion === 'FALSE') {
      var formEl = document.getElementById('form-confirmacion');
      var statusMsg = guestInfo.confirmacion === 'TRUE'
        ? 'Ya confirmaste tu asistencia'
        : 'Registramos que no podrás asistir';
      formEl.innerHTML =
        '<div style="text-align:center;padding:24px 0;">' +
          '<p style="font-size:20px;color:#BFA880;margin-bottom:12px;">' + statusMsg + '</p>' +
          '<p style="font-size:14px;color:#999;">Si deseas cambiar tu respuesta, presiona el botón de abajo.</p>' +
          '<button type="button" class="btn btn--link" id="btn-change-response" style="margin-top:16px;font-size:14px;">Cambiar respuesta</button>' +
        '</div>';
      document.getElementById('btn-change-response').addEventListener('click', function () {
        formEl.innerHTML = originalFormHTML;
        rebindFormEvents();
      });
    }
  }

  // Guardar HTML original del form para poder restaurarlo
  var originalFormHTML = document.getElementById('form-confirmacion').innerHTML;

  function rebindFormEvents() {
    var formEl = document.getElementById('form-confirmacion');
    var si = document.getElementById('alergia-si');
    var no = document.getElementById('alergia-no');
    var gc = document.getElementById('group-cual');
    var ad = document.getElementById('alergia-detalle');
    var submitBtn = formEl.querySelector('.btn--submit');

    gc.style.display = 'none';
    if (submitBtn) submitBtn.disabled = true;

    si.addEventListener('change', function () {
      gc.style.display = '';
      ad.disabled = false;
      checkFormComplete(formEl, submitBtn);
    });
    no.addEventListener('change', function () {
      gc.style.display = 'none';
      ad.disabled = true;
      ad.value = '';
      checkFormComplete(formEl, submitBtn);
    });

    formEl.querySelectorAll('input[type="radio"]').forEach(function (r) {
      r.addEventListener('change', function () { checkFormComplete(formEl, submitBtn); });
    });
  }

  // Iniciar: si hay token, buscar info del invitado primero
  if (guestToken && isConfigured()) {
    Promise.race([
      fetch(APPS_SCRIPT_URL + '?' + new URLSearchParams({
        action: 'info',
        token: guestToken
      }))
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.ok) guestInfo = data;
        }),
      new Promise(function (_, reject) {
        setTimeout(function () { reject(new Error('timeout')); }, 3000);
      })
    ])
      .catch(function () { /* timeout o error — continuar sin personalización */ })
      .then(function () {
        personalizeContent();
        initIntro();
      });
  } else {
    initIntro();
  }

  // ============================
  // COUNTDOWN TIMER
  // ============================
  var WEDDING_DATE = new Date('2026-05-01T19:00:00-04:00');

  var daysEl = document.getElementById('countdown-days');
  var hoursEl = document.getElementById('countdown-hours');
  var minutesEl = document.getElementById('countdown-minutes');

  function updateCountdown() {
    var now = new Date();
    var diff = WEDDING_DATE - now;

    if (diff <= 0) {
      daysEl.textContent = '0';
      hoursEl.textContent = '0';
      minutesEl.textContent = '0';
      return;
    }

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    daysEl.textContent = days;
    hoursEl.textContent = hours;
    minutesEl.textContent = minutes;
  }

  updateCountdown();
  setInterval(updateCountdown, 60000);

  // ============================
  // FULLSCREEN SCREENS
  // ============================

  // Ocultar botón de confirmar si no hay token (modo preview)
  var btnConfirmar = document.getElementById('btn-confirmar');
  if (!guestToken) {
    btnConfirmar.style.display = 'none';
  }

  btnConfirmar.addEventListener('click', function () {
    var screen = document.getElementById('screen-confirmar');
    screen.classList.add('is-open');
    screen.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  });

  document.getElementById('btn-close-confirmar').addEventListener('click', function () {
    var screen = document.getElementById('screen-confirmar');
    screen.classList.remove('is-open');
    screen.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  });

  document.getElementById('btn-mapa').addEventListener('click', function () {
    var screen = document.getElementById('screen-mapa');
    screen.classList.add('is-open');
    screen.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  });

  document.getElementById('btn-close-mapa').addEventListener('click', function () {
    var screen = document.getElementById('screen-mapa');
    screen.classList.remove('is-open');
    screen.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.fullscreen.is-open').forEach(function (s) {
        s.classList.remove('is-open');
        s.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
      });
    }
  });

  // ============================
  // FORM HANDLING
  // ============================
  var form = document.getElementById('form-confirmacion');
  var alergiaSi = document.getElementById('alergia-si');
  var alergiaNo = document.getElementById('alergia-no');
  var groupCual = document.getElementById('group-cual');
  var alergiaDetalle = document.getElementById('alergia-detalle');
  var submitBtn = form.querySelector('.btn--submit');

  function checkFormComplete(f, btn) {
    if (!f || !btn) return;
    var asistencia = f.querySelector('input[name="asistencia"]:checked');
    var alergia = f.querySelector('input[name="alergia"]:checked');
    btn.disabled = !(asistencia && alergia);
  }

  // Ocultar campo "¿Cuál?" por defecto, submit deshabilitado
  groupCual.style.display = 'none';
  if (submitBtn) submitBtn.disabled = true;

  alergiaSi.addEventListener('change', function () {
    groupCual.style.display = '';
    alergiaDetalle.disabled = false;
    checkFormComplete(form, submitBtn);
  });
  alergiaNo.addEventListener('change', function () {
    groupCual.style.display = 'none';
    alergiaDetalle.disabled = true;
    alergiaDetalle.value = '';
    checkFormComplete(form, submitBtn);
  });

  form.querySelectorAll('input[type="radio"]').forEach(function (r) {
    r.addEventListener('change', function () { checkFormComplete(form, submitBtn); });
  });

  var loadingMessages = [
    'Guardando tu lugar en nuestra mesa',
    'Preparando tu copa de bienvenida',
    'Reservando un brindis en tu honor',
    'Anotando tu nombre en nuestra historia'
  ];

  function showFormLoading(container) {
    var overlay = document.createElement('div');
    overlay.className = 'form-loading';
    overlay.innerHTML =
      '<div class="form-loading__spinner">' +
        '<div class="form-loading__ring"></div>' +
        '<div class="form-loading__monogram">N&F</div>' +
      '</div>' +
      '<div class="form-loading__message"></div>' +
      '<div class="form-loading__dots">' +
        '<span class="form-loading__dot"></span>' +
        '<span class="form-loading__dot"></span>' +
        '<span class="form-loading__dot"></span>' +
      '</div>';
    container.appendChild(overlay);

    var msgEl = overlay.querySelector('.form-loading__message');
    var idx = 0;
    msgEl.textContent = loadingMessages[idx];

    var msgInterval = setInterval(function () {
      idx = (idx + 1) % loadingMessages.length;
      msgEl.style.opacity = '0';
      setTimeout(function () {
        msgEl.textContent = loadingMessages[idx];
        msgEl.style.opacity = '1';
      }, 300);
    }, 2500);

    return { overlay: overlay, interval: msgInterval };
  }

  function hideFormLoading(loading, callback) {
    clearInterval(loading.interval);
    loading.overlay.style.opacity = '0';
    loading.overlay.style.transition = 'opacity 0.4s ease';
    setTimeout(function () {
      loading.overlay.remove();
      if (callback) callback();
    }, 400);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var formData = new FormData(form);
    var data = {
      asistencia: formData.get('asistencia') === 'si' ? 'TRUE' : 'FALSE',
      alergia: formData.get('alergia') === 'si' ? 'TRUE' : 'FALSE',
      alergia_detalle: formData.get('alergia_detalle') || ''
    };

    var screen = document.getElementById('screen-confirmar');
    var content = screen.querySelector('.fullscreen__content');
    var loading = showFormLoading(content);

    function closeModal() {
      screen.classList.remove('is-open');
      screen.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      form.reset();
      groupCual.style.display = 'none';
    }

    if (guestToken && isConfigured()) {
      var confirmUrl = APPS_SCRIPT_URL + '?' + new URLSearchParams({
        action: 'confirmar',
        token: guestToken,
        asistencia: data.asistencia,
        alergia: data.alergia,
        detalle: data.alergia_detalle
      }).toString();

      var minTime = new Promise(function (resolve) { setTimeout(resolve, 3000); });

      var request = new Promise(function (resolve) {
        var img = new Image();
        img.onload = img.onerror = function () { resolve(); };
        img.src = confirmUrl;
      });

      Promise.all([minTime, request]).then(function () {
        hideFormLoading(loading, function () {
          closeModal();
          showToast('¡Gracias por confirmar!');
        });
      });
    } else {
      setTimeout(function () {
        hideFormLoading(loading, function () {
          closeModal();
          showToast('¡Gracias por confirmar!');
        });
      }, 2500);
    }
  });

  // ============================
  // TOAST NOTIFICATION
  // ============================
  function showToast(message) {
    var existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add('is-visible');
    });

    setTimeout(function () {
      toast.classList.remove('is-visible');
      setTimeout(function () {
        toast.remove();
      }, 400);
    }, 3000);
  }

  // ============================
  // SCROLL ANIMATIONS
  // ============================
  var fadeTargets = document.querySelectorAll(
    '.countdown, .message, .fecha, .fiesta__card, .fiesta__title'
  );

  fadeTargets.forEach(function (el) {
    el.classList.add('fade-in');
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });

  fadeTargets.forEach(function (el) {
    observer.observe(el);
  });

  // ============================
  // LEAFLET MAP
  // ============================
  var mapInitialized = false;

  document.getElementById('btn-mapa').addEventListener('click', function () {
    if (!mapInitialized) {
      setTimeout(function () {
        var map = L.map('leaflet-map', {
          zoomControl: false
        }).setView([-34.5935606, -70.9626256], 15);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '',
          maxZoom: 19
        }).addTo(map);

        var customIcon = L.icon({
          iconUrl: 'assets/marcador-gps.svg',
          iconSize: [44, 46],
          iconAnchor: [22, 42],
          popupAnchor: [0, -42]
        });

        L.marker([-34.5935606, -70.9626256], { icon: customIcon })
          .addTo(map)
          .on('click', function () {
            window.open('https://www.google.com/maps/dir/?api=1&destination=-34.5935606,-70.9626256&destination_place_id=ChIJneu9TlyQZpYR6t1_TF0YCBAl&travelmode=driving', '_blank');
          });

        setTimeout(function () { map.invalidateSize(); }, 200);
        mapInitialized = true;
      }, 100);
    }
  });

})();
