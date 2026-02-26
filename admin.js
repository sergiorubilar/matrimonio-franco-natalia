/* ========================================
   ADMIN PANEL — Natalia & Franco
   ======================================== */

(function () {
  'use strict';

  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyYSHCf-zHTPKuvnms_6e_miHZzn3lAAZIp1wtHepb0kUAeImIzTS-9ZOlUnVqOLmXr/exec';
  var BASE_URL = 'https://sergiorubilar.github.io/matrimonio-franco-natalia';

  var guests = [];
  var password = '';

  // ============================
  // DOM ELEMENTS
  // ============================
  var loginScreen = document.getElementById('login');
  var dashboard = document.getElementById('dashboard');
  var dashLoading = document.getElementById('dash-loading');
  var mainContent = document.getElementById('main-content');
  var loginForm = document.getElementById('login-form');
  var loginPassword = document.getElementById('login-password');
  var loginError = document.getElementById('login-error');
  var loginBtn = document.getElementById('login-btn');

  var searchInput = document.getElementById('search-input');
  var filterStatus = document.getElementById('filter-status');
  var filterGroup = document.getElementById('filter-group');
  var tbody = document.getElementById('guests-tbody');
  var tableEmpty = document.getElementById('table-empty');
  var table = document.getElementById('guests-table');

  // ============================
  // LOGIN
  // ============================
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    loginError.textContent = '';
    loginBtn.disabled = true;
    loginBtn.textContent = 'Verificando...';
    password = loginPassword.value;

    fetchAdmin(password)
      .then(function (data) {
        if (data.error) {
          loginError.textContent = data.error;
          loginBtn.disabled = false;
          loginBtn.textContent = 'Ingresar';
          return;
        }
        sessionStorage.setItem('admin_pw', password);
        loginScreen.style.display = 'none';
        dashboard.style.display = '';
        processData(data);
      })
      .catch(function () {
        loginError.textContent = 'Error de conexión. Intenta de nuevo.';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Ingresar';
      });
  });

  // Check saved session
  var savedPw = sessionStorage.getItem('admin_pw');
  if (savedPw) {
    password = savedPw;
    loginScreen.style.display = 'none';
    dashboard.style.display = '';
    loadData();
  }

  // Logout
  document.getElementById('btn-logout').addEventListener('click', function () {
    sessionStorage.removeItem('admin_pw');
    password = '';
    guests = [];
    loginPassword.value = '';
    loginBtn.disabled = false;
    loginBtn.textContent = 'Ingresar';
    loginError.textContent = '';
    dashboard.style.display = 'none';
    loginScreen.style.display = '';
  });

  // ============================
  // DATA FETCHING
  // ============================
  function fetchAdmin(pw) {
    return fetch(APPS_SCRIPT_URL + '?' + new URLSearchParams({
      action: 'admin',
      password: pw
    }))
      .then(function (r) { return r.json(); });
  }

  function loadData() {
    dashLoading.style.display = '';
    mainContent.style.display = 'none';

    fetchAdmin(password)
      .then(function (data) {
        if (data.error) {
          sessionStorage.removeItem('admin_pw');
          dashboard.style.display = 'none';
          loginScreen.style.display = '';
          loginError.textContent = data.error;
          return;
        }
        processData(data);
      })
      .catch(function () {
        dashLoading.querySelector('.dash-loading__text').textContent = 'Error al cargar. Recarga la página.';
      });
  }

  function processData(data) {
    guests = (data.invitados || []).map(function (g) {
      g.confirmacion = (g.confirmacion || '').toUpperCase();
      g.alergias = (g.alergias || '').toUpperCase();
      return g;
    });
    updateStats(data.stats);
    populateGroupFilter();
    renderTable();
    dashLoading.style.display = 'none';
    mainContent.style.display = '';
  }

  // Refresh
  document.getElementById('btn-refresh').addEventListener('click', loadData);

  // ============================
  // STATS
  // ============================
  function updateStats(stats) {
    document.getElementById('stat-total').textContent = stats.totalInvitados;
    document.getElementById('stat-personas').textContent = stats.totalPersonas;
    document.getElementById('stat-confirmados').textContent = stats.confirmados;
    document.getElementById('stat-pendientes').textContent = stats.pendientes;
    document.getElementById('stat-declinados').textContent = stats.declinados;
    document.getElementById('stat-alergias').textContent = stats.conAlergias;
  }

  // ============================
  // FILTERS
  // ============================
  function populateGroupFilter() {
    var groups = {};
    guests.forEach(function (g) {
      if (g.grupo) groups[g.grupo] = true;
    });

    filterGroup.innerHTML = '<option value="all">Todos los grupos</option>';
    Object.keys(groups).sort().forEach(function (group) {
      var opt = document.createElement('option');
      opt.value = group;
      opt.textContent = group;
      filterGroup.appendChild(opt);
    });
  }

  function getFilteredGuests() {
    var search = searchInput.value.toLowerCase();
    var status = filterStatus.value;
    var group = filterGroup.value;

    return guests.filter(function (g) {
      // Search
      if (search && !(g.nombre + ' ' + g.acompanante).toLowerCase().includes(search)) return false;

      // Status
      if (status === 'confirmed' && g.confirmacion !== 'TRUE') return false;
      if (status === 'declined' && g.confirmacion !== 'FALSE') return false;
      if (status === 'pending' && g.confirmacion !== '') return false;

      // Group
      if (group !== 'all' && g.grupo !== group) return false;

      return true;
    });
  }

  searchInput.addEventListener('input', renderTable);
  filterStatus.addEventListener('change', renderTable);
  filterGroup.addEventListener('change', renderTable);

  // ============================
  // TABLE RENDERING
  // ============================
  function renderTable() {
    var filtered = getFilteredGuests();
    tbody.innerHTML = '';

    if (filtered.length === 0) {
      table.style.display = 'none';
      tableEmpty.style.display = '';
      return;
    }

    table.style.display = '';
    tableEmpty.style.display = 'none';

    filtered.forEach(function (g) {
      var tr = document.createElement('tr');

      // Status badge
      var statusBadge;
      if (g.confirmacion === 'TRUE') {
        statusBadge = '<span class="badge badge--confirmed">Confirmado</span>';
      } else if (g.confirmacion === 'FALSE') {
        statusBadge = '<span class="badge badge--declined">No asiste</span>';
      } else {
        statusBadge = '<span class="badge badge--pending">Pendiente</span>';
      }

      // Allergy badge
      var allergyBadge;
      if (g.alergias === 'TRUE') {
        allergyBadge = '<span class="badge badge--allergy" title="' + escapeHtml(g.detalleAlergias) + '">Sí</span>';
      } else if (g.alergias === 'FALSE') {
        allergyBadge = '<span class="badge badge--none">No</span>';
      } else {
        allergyBadge = '<span class="badge badge--none">—</span>';
      }

      var waLink = buildWhatsAppLink(g);

      tr.innerHTML =
        '<td><strong>' + escapeHtml(g.nombre) + '</strong></td>' +
        '<td>' + escapeHtml(g.acompanante || '—') + '</td>' +
        '<td>' + escapeHtml(g.grupo || '—') + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td>' + allergyBadge + '</td>' +
        '<td><div class="row-actions">' +
          '<a class="row-btn row-btn--wa" href="' + escapeHtml(waLink) + '" target="_blank" title="Enviar WhatsApp">WA</a>' +
          '<button class="row-btn btn-detail" data-id="' + g.id + '" title="Ver detalle">Ver</button>' +
        '</div></td>';

      tbody.appendChild(tr);
    });

    // Attach detail events
    tbody.querySelectorAll('.btn-detail').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-id');
        var guest = guests.find(function (g) { return String(g.id) === id; });
        if (guest) showDetail(guest);
      });
    });
  }

  // ============================
  // WHATSAPP LINKS
  // ============================
  function buildWhatsAppLink(g) {
    var url = BASE_URL + '/?token=' + g.token;
    var saludo = g.nombre.split(' ')[0];
    if (g.acompanante && g.acompanante.toLowerCase() !== 'pareja' && g.acompanante.trim() !== '') {
      saludo += ' y ' + g.acompanante.split(' ')[0];
    }

    var mensaje = 'Hola ' + saludo + '!\n\n'
      + 'Están cordialmente invitados al matrimonio de *Natalia & Franco*\n\n'
      + 'Viernes 1 de mayo, 2026\n'
      + '19:00 hrs\n'
      + 'Centro de Eventos Claro de Luna, San Fernando\n\n'
      + 'Confirma tu asistencia aquí:\n'
      + url;

    return 'https://wa.me/' + g.telefono + '?text=' + encodeURIComponent(mensaje);
  }

  function buildInvitationUrl(g) {
    return BASE_URL + '/?token=' + g.token;
  }

  // ============================
  // BULK WHATSAPP SEND
  // ============================
  var waModal = document.getElementById('wa-modal');
  var waModalDesc = document.getElementById('wa-modal-desc');
  var waProgress = document.getElementById('wa-progress');
  var waBarFill = document.getElementById('wa-bar-fill');
  var waStatus = document.getElementById('wa-status');
  var waStartBtn = document.getElementById('wa-start');
  var waCancelBtn = document.getElementById('wa-cancel');
  var waSendAborted = false;

  document.getElementById('btn-send-all').addEventListener('click', function () {
    var pendingGuests = guests.filter(function (g) {
      return g.telefono && g.token;
    });

    waModalDesc.textContent = 'Se abrirán ' + pendingGuests.length + ' ventanas de WhatsApp, una cada 3 segundos. Solo debes presionar "Enviar" en cada una.';
    waProgress.style.display = 'none';
    waBarFill.style.width = '0%';
    waStartBtn.style.display = '';
    waCancelBtn.textContent = 'Cancelar';
    waModal.style.display = '';
    waSendAborted = false;
  });

  waStartBtn.addEventListener('click', function () {
    waStartBtn.style.display = 'none';
    waProgress.style.display = '';

    var pendingGuests = guests.filter(function (g) {
      return g.telefono && g.token;
    });

    var i = 0;
    function sendNext() {
      if (waSendAborted || i >= pendingGuests.length) {
        waStatus.textContent = waSendAborted ? 'Envío cancelado.' : 'Envío completado.';
        waBarFill.style.width = '100%';
        waCancelBtn.textContent = 'Cerrar';
        return;
      }

      var g = pendingGuests[i];
      var link = buildWhatsAppLink(g);
      window.open(link, '_blank');

      i++;
      var pct = Math.round((i / pendingGuests.length) * 100);
      waBarFill.style.width = pct + '%';
      waStatus.textContent = 'Enviando ' + i + ' de ' + pendingGuests.length + ': ' + g.nombre;

      setTimeout(sendNext, 3000);
    }

    sendNext();
  });

  waCancelBtn.addEventListener('click', function () {
    waSendAborted = true;
    waModal.style.display = 'none';
  });

  // ============================
  // GUEST DETAIL MODAL
  // ============================
  var detailModal = document.getElementById('detail-modal');

  function showDetail(g) {
    document.getElementById('detail-name').textContent = g.nombre;

    var url = buildInvitationUrl(g);
    var statusText = g.confirmacion === 'TRUE' ? 'Confirmado' : g.confirmacion === 'FALSE' ? 'No asiste' : 'Pendiente';
    var alergiasText = g.alergias === 'TRUE' ? 'Sí — ' + (g.detalleAlergias || 'sin detalle') : g.alergias === 'FALSE' ? 'No' : 'Sin respuesta';

    var grid = document.getElementById('detail-grid');
    grid.innerHTML =
      '<span class="detail-grid__label">Grupo</span><span class="detail-grid__value">' + escapeHtml(g.grupo || '—') + '</span>' +
      '<span class="detail-grid__label">Acompañante</span><span class="detail-grid__value">' + escapeHtml(g.acompanante || 'Sin acompañante') + '</span>' +
      '<span class="detail-grid__label">Teléfono</span><span class="detail-grid__value">' + escapeHtml(g.telefono || '—') + '</span>' +
      '<span class="detail-grid__label">Estado</span><span class="detail-grid__value">' + statusText + '</span>' +
      '<span class="detail-grid__label">Alergias</span><span class="detail-grid__value">' + escapeHtml(alergiasText) + '</span>' +
      '<span class="detail-grid__label">Link invitación</span><span class="detail-grid__value">' + escapeHtml(url) + '</span>';

    document.getElementById('detail-wa').onclick = function () {
      window.open(buildWhatsAppLink(g), '_blank');
    };

    var detailLink = document.getElementById('detail-link');
    detailLink.href = url;

    detailModal.style.display = '';
  }

  document.getElementById('detail-close').addEventListener('click', function () {
    detailModal.style.display = 'none';
  });

  detailModal.addEventListener('click', function (e) {
    if (e.target === detailModal) detailModal.style.display = 'none';
  });

  // ============================
  // UTILS
  // ============================
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

})();
