/* ========================================
   ADMIN PANEL — Natalia & Franco
   ======================================== */

(function () {
  'use strict';

  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyYSHCf-zHTPKuvnms_6e_miHZzn3lAAZIp1wtHepb0kUAeImIzTS-9ZOlUnVqOLmXr/exec';
  var BASE_URL = 'https://sergiorubilar.github.io/matrimonio-franco-natalia';

  var guests = [];
  var password = '';
  var currentDetailGuest = null;

  // ============================
  // MESSAGE TEMPLATE
  // ============================
  var DEFAULT_MSG_TEMPLATE = 'Hola {saludo}!\n\n'
    + 'Están cordialmente invitados al matrimonio de *Natalia & Franco*\n\n'
    + 'Viernes 1 de mayo, 2026\n'
    + '19:00 hrs\n'
    + 'Centro de Eventos Claro de Luna, San Fernando\n\n'
    + 'Confirma tu asistencia aquí:\n'
    + '{link}';

  function getMsgTemplate() {
    return localStorage.getItem('wa_msg_template') || DEFAULT_MSG_TEMPLATE;
  }

  function saveMsgTemplate(tpl) {
    localStorage.setItem('wa_msg_template', tpl);
  }

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

  function adminAction(sub, extraParams) {
    var params = { action: 'admin', password: password, sub: sub };
    var extra = extraParams || {};
    Object.keys(extra).forEach(function (k) {
      params[k] = extra[k];
    });
    return fetch(APPS_SCRIPT_URL + '?' + new URLSearchParams(params))
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

    // Timestamp
    var now = new Date();
    document.getElementById('last-updated').textContent =
      'Actualizado: ' + now.toLocaleDateString('es-CL') + ' ' + now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }

  // Refresh
  document.getElementById('btn-refresh').addEventListener('click', loadData);

  // Sync tokens
  document.getElementById('btn-sync').addEventListener('click', function () {
    var btn = this;
    btn.disabled = true;
    btn.textContent = 'Sincronizando...';

    adminAction('syncTokens')
      .then(function (data) {
        if (data.error) {
          showToast(data.error, 'error');
        } else {
          showToast(data.mensaje, data.synced > 0 ? 'success' : 'success');
          if (data.synced > 0) loadData();
        }
        btn.disabled = false;
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Sincronizar tokens';
      })
      .catch(function () {
        showToast('Error de conexión', 'error');
        btn.disabled = false;
        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg> Sincronizar tokens';
      });
  });

  // ============================
  // TOAST NOTIFICATIONS
  // ============================
  function showToast(message, type) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast toast--' + (type || 'success') + ' toast--show';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.className = 'toast';
    }, 3500);
  }

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
      if (search && !(g.nombre + ' ' + g.acompanante).toLowerCase().includes(search)) return false;
      if (status === 'confirmed' && g.confirmacion !== 'TRUE') return false;
      if (status === 'declined' && g.confirmacion !== 'FALSE') return false;
      if (status === 'pending' && g.confirmacion !== '') return false;
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

      var statusBadge;
      if (g.confirmacion === 'TRUE') {
        statusBadge = '<span class="badge badge--confirmed">Confirmado</span>';
      } else if (g.confirmacion === 'FALSE') {
        statusBadge = '<span class="badge badge--declined">No asiste</span>';
      } else {
        statusBadge = '<span class="badge badge--pending">Pendiente</span>';
      }

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
          '<button class="row-btn btn-detail" data-token="' + escapeHtml(g.token) + '" title="Ver detalle">Ver</button>' +
        '</div></td>';

      tbody.appendChild(tr);
    });

    // Attach detail events
    tbody.querySelectorAll('.btn-detail').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var token = this.getAttribute('data-token');
        var guest = guests.find(function (g) { return g.token === token; });
        if (guest) showDetail(guest);
      });
    });
  }

  // ============================
  // WHATSAPP LINKS
  // ============================
  function buildSaludo(g) {
    var saludo = g.nombre.split(' ')[0];
    if (g.acompanante && g.acompanante.toLowerCase() !== 'pareja' && g.acompanante.trim() !== '') {
      saludo += ' y ' + g.acompanante.split(' ')[0];
    }
    return saludo;
  }

  function buildMessage(g) {
    var url = BASE_URL + '/?token=' + g.token;
    var template = getMsgTemplate();
    return template
      .replace(/\{saludo\}/g, buildSaludo(g))
      .replace(/\{nombre\}/g, g.nombre || '')
      .replace(/\{acompanante\}/g, g.acompanante || '')
      .replace(/\{link\}/g, url);
  }

  function buildWhatsAppLink(g) {
    return 'https://wa.me/' + g.telefono + '?text=' + encodeURIComponent(buildMessage(g));
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

  var waTarget = document.getElementById('wa-target');
  var waPreview = document.getElementById('wa-preview');
  var waFilter = document.getElementById('wa-filter');

  function getWaSendList() {
    var target = waTarget.value;
    return guests.filter(function (g) {
      if (!g.telefono || !g.token) return false;
      if (target === 'pending' && g.confirmacion !== '') return false;
      return true;
    });
  }

  function updateWaPreview() {
    var list = getWaSendList();
    waModalDesc.textContent = 'Se abrirán ' + list.length + ' ventanas de WhatsApp, una cada 3 segundos. Solo debes presionar "Enviar" en cada una.';
    waPreview.innerHTML = list.map(function (g, i) {
      return '<div style="padding:4px 0;border-bottom:1px solid #F2EDE5;">' + (i + 1) + '. ' + escapeHtml(g.nombre) + (g.acompanante ? ' (+' + escapeHtml(g.acompanante) + ')' : '') + '</div>';
    }).join('');
  }

  document.getElementById('btn-send-all').addEventListener('click', function () {
    waProgress.style.display = 'none';
    waBarFill.style.width = '0%';
    waStartBtn.style.display = '';
    waFilter.style.display = '';
    waCancelBtn.textContent = 'Cancelar';
    waSendAborted = false;
    updateWaPreview();
    waModal.style.display = '';
  });

  waTarget.addEventListener('change', updateWaPreview);

  waStartBtn.addEventListener('click', function () {
    waStartBtn.style.display = 'none';
    waFilter.style.display = 'none';
    waPreview.style.display = 'none';
    waProgress.style.display = '';

    var pendingGuests = getWaSendList();

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
    currentDetailGuest = g;
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

    // Show/hide reset button depending on whether guest has responded
    var resetBtn = document.getElementById('detail-reset');
    if (g.confirmacion === 'TRUE' || g.confirmacion === 'FALSE') {
      resetBtn.style.display = '';
    } else {
      resetBtn.style.display = 'none';
    }

    detailModal.style.display = '';
  }

  document.getElementById('detail-copy').addEventListener('click', function () {
    var link = document.getElementById('detail-link').href;
    navigator.clipboard.writeText(link).then(function () {
      var btn = document.getElementById('detail-copy');
      btn.textContent = 'Copiado!';
      setTimeout(function () { btn.textContent = 'Copiar link'; }, 2000);
    });
  });

  document.getElementById('detail-close').addEventListener('click', function () {
    detailModal.style.display = 'none';
  });

  detailModal.addEventListener('click', function (e) {
    if (e.target === detailModal) detailModal.style.display = 'none';
  });

  // Detail modal — Edit button
  document.getElementById('detail-edit').addEventListener('click', function () {
    if (currentDetailGuest) {
      detailModal.style.display = 'none';
      openEditForm(currentDetailGuest);
    }
  });

  // Detail modal — Reset confirmation
  document.getElementById('detail-reset').addEventListener('click', function () {
    if (!currentDetailGuest) return;
    var btn = this;
    btn.disabled = true;
    btn.textContent = 'Reseteando...';

    adminAction('resetConfirm', { token: currentDetailGuest.token })
      .then(function (data) {
        if (data.error) {
          showToast(data.error, 'error');
        } else {
          showToast(data.mensaje, 'success');
          detailModal.style.display = 'none';
          loadData();
        }
        btn.disabled = false;
        btn.textContent = 'Resetear confirmación';
      })
      .catch(function () {
        showToast('Error de conexión', 'error');
        btn.disabled = false;
        btn.textContent = 'Resetear confirmación';
      });
  });

  // Detail modal — Delete button
  document.getElementById('detail-delete').addEventListener('click', function () {
    if (currentDetailGuest) {
      detailModal.style.display = 'none';
      openDeleteConfirm(currentDetailGuest);
    }
  });

  // ============================
  // GUEST FORM MODAL (ADD / EDIT)
  // ============================
  var guestFormModal = document.getElementById('guest-form-modal');
  var guestForm = document.getElementById('guest-form');
  var guestFormTitle = document.getElementById('guest-form-title');
  var gfNombre = document.getElementById('gf-nombre');
  var gfAcompanante = document.getElementById('gf-acompanante');
  var gfGrupo = document.getElementById('gf-grupo');
  var gfTelefono = document.getElementById('gf-telefono');
  var gfToken = document.getElementById('gf-token');
  var gfSubmit = document.getElementById('gf-submit');

  function populateGruposList() {
    var datalist = document.getElementById('grupos-list');
    var groups = {};
    guests.forEach(function (g) { if (g.grupo) groups[g.grupo] = true; });
    datalist.innerHTML = '';
    Object.keys(groups).sort().forEach(function (group) {
      var opt = document.createElement('option');
      opt.value = group;
      datalist.appendChild(opt);
    });
  }

  // Add guest button
  document.getElementById('btn-add-guest').addEventListener('click', function () {
    guestFormTitle.textContent = 'Agregar invitado';
    gfSubmit.textContent = 'Agregar';
    gfNombre.value = '';
    gfAcompanante.value = '';
    gfGrupo.value = '';
    gfTelefono.value = '';
    gfToken.value = '';
    populateGruposList();
    guestFormModal.style.display = '';
    gfNombre.focus();
  });

  // Edit guest
  function openEditForm(g) {
    guestFormTitle.textContent = 'Editar invitado';
    gfSubmit.textContent = 'Guardar cambios';
    gfNombre.value = g.nombre || '';
    gfAcompanante.value = g.acompanante || '';
    gfGrupo.value = g.grupo || '';
    gfTelefono.value = g.telefono || '';
    gfToken.value = g.token;
    populateGruposList();
    guestFormModal.style.display = '';
    gfNombre.focus();
  }

  // Form submit
  guestForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var token = gfToken.value;
    var isEdit = !!token;
    var sub = isEdit ? 'editGuest' : 'addGuest';
    var params = {
      nombre: gfNombre.value.trim(),
      acompanante: gfAcompanante.value.trim(),
      grupo: gfGrupo.value.trim(),
      telefono: gfTelefono.value.trim()
    };
    if (isEdit) params.token = token;

    var originalText = gfSubmit.textContent;
    gfSubmit.disabled = true;
    gfSubmit.textContent = 'Guardando...';

    adminAction(sub, params)
      .then(function (data) {
        if (data.error) {
          showToast(data.error, 'error');
        } else {
          showToast(data.mensaje, 'success');
          guestFormModal.style.display = 'none';
          loadData();
        }
        gfSubmit.disabled = false;
        gfSubmit.textContent = originalText;
      })
      .catch(function () {
        showToast('Error de conexión', 'error');
        gfSubmit.disabled = false;
        gfSubmit.textContent = originalText;
      });
  });

  // Cancel form
  document.getElementById('gf-cancel').addEventListener('click', function () {
    guestFormModal.style.display = 'none';
  });

  guestFormModal.addEventListener('click', function (e) {
    if (e.target === guestFormModal) guestFormModal.style.display = 'none';
  });

  // ============================
  // DELETE CONFIRMATION
  // ============================
  var confirmModal = document.getElementById('confirm-modal');
  var confirmYes = document.getElementById('confirm-yes');
  var pendingDeleteToken = null;

  function openDeleteConfirm(g) {
    document.getElementById('confirm-title').textContent = 'Eliminar invitado';
    document.getElementById('confirm-desc').textContent =
      'Se eliminará permanentemente a "' + g.nombre + '" de la lista de invitados. Esta acción no se puede deshacer.';
    pendingDeleteToken = g.token;
    confirmYes.textContent = 'Eliminar';
    confirmYes.disabled = false;
    confirmModal.style.display = '';
  }

  confirmYes.addEventListener('click', function () {
    if (!pendingDeleteToken) return;
    confirmYes.disabled = true;
    confirmYes.textContent = 'Eliminando...';

    adminAction('deleteGuest', { token: pendingDeleteToken })
      .then(function (data) {
        if (data.error) {
          showToast(data.error, 'error');
        } else {
          showToast('Invitado eliminado', 'success');
          confirmModal.style.display = 'none';
          loadData();
        }
        confirmYes.disabled = false;
        confirmYes.textContent = 'Eliminar';
        pendingDeleteToken = null;
      })
      .catch(function () {
        showToast('Error de conexión', 'error');
        confirmYes.disabled = false;
        confirmYes.textContent = 'Eliminar';
        pendingDeleteToken = null;
      });
  });

  document.getElementById('confirm-no').addEventListener('click', function () {
    confirmModal.style.display = 'none';
    pendingDeleteToken = null;
  });

  confirmModal.addEventListener('click', function (e) {
    if (e.target === confirmModal) {
      confirmModal.style.display = 'none';
      pendingDeleteToken = null;
    }
  });

  // ============================
  // MESSAGE TEMPLATE MODAL
  // ============================
  var msgModal = document.getElementById('msg-modal');
  var msgTemplate = document.getElementById('msg-template');
  var msgPreview = document.getElementById('msg-preview');

  function updateMsgPreview() {
    var sampleGuest = guests[0] || {
      nombre: 'Juan Pérez', acompanante: 'María López', token: 'abc123'
    };
    var tpl = msgTemplate.value;
    var url = BASE_URL + '/?token=' + sampleGuest.token;
    var preview = tpl
      .replace(/\{saludo\}/g, buildSaludo(sampleGuest))
      .replace(/\{nombre\}/g, sampleGuest.nombre || '')
      .replace(/\{acompanante\}/g, sampleGuest.acompanante || '')
      .replace(/\{link\}/g, url);
    msgPreview.textContent = preview;
  }

  document.getElementById('btn-edit-msg').addEventListener('click', function () {
    msgTemplate.value = getMsgTemplate();
    updateMsgPreview();
    msgModal.style.display = '';
  });

  msgTemplate.addEventListener('input', updateMsgPreview);

  document.getElementById('msg-save').addEventListener('click', function () {
    saveMsgTemplate(msgTemplate.value);
    showToast('Mensaje guardado', 'success');
    msgModal.style.display = 'none';
    renderTable(); // re-render WA links with new message
  });

  document.getElementById('msg-reset').addEventListener('click', function () {
    msgTemplate.value = DEFAULT_MSG_TEMPLATE;
    updateMsgPreview();
  });

  document.getElementById('msg-cancel').addEventListener('click', function () {
    msgModal.style.display = 'none';
  });

  msgModal.addEventListener('click', function (e) {
    if (e.target === msgModal) msgModal.style.display = 'none';
  });

  // ============================
  // CSV EXPORT
  // ============================
  document.getElementById('btn-export-csv').addEventListener('click', function () {
    if (!guests.length) return;
    var headers = ['Nombre', 'Acompañante', 'Grupo', 'Teléfono', 'Confirmación', 'Alergias', 'Detalle alergias', 'Link invitación'];
    var rows = guests.map(function (g) {
      var status = g.confirmacion === 'TRUE' ? 'Confirmado' : g.confirmacion === 'FALSE' ? 'No asiste' : 'Pendiente';
      var alergia = g.alergias === 'TRUE' ? 'Sí' : g.alergias === 'FALSE' ? 'No' : '';
      return [g.nombre, g.acompanante, g.grupo, g.telefono, status, alergia, g.detalleAlergias, buildInvitationUrl(g)];
    });

    var csv = '\uFEFF' + headers.join(',') + '\n' + rows.map(function (r) {
      return r.map(function (cell) {
        return '"' + String(cell || '').replace(/"/g, '""') + '"';
      }).join(',');
    }).join('\n');

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'invitados-natalia-franco.csv';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  // ============================
  // UTILS
  // ============================
  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

})();
