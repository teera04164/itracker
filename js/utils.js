// ============================================================
// Utility Helpers
// ============================================================

function esc(str) {
  return String(str || '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('th-TH', {
      day: 'numeric', month: 'short', year: '2-digit'
    });
  } catch (e) {
    return '';
  }
}

function shk(id) {
  const el = document.getElementById(id);
  el.style.borderColor = 'var(--accent2)';
  setTimeout(() => el.style.borderColor = '', 1500);
}

// ============================================================
// Modal
// ============================================================

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    ['add-modal', 'grp-modal', 'ws-modal', 'view-modal'].forEach(closeModal);
  }
});

// ============================================================
// Toast
// ============================================================

let toastTimer;

function toast(msg, type = 'success') {
  const el = document.getElementById('toast');

  const colors = { success: 'var(--success)', warn: 'var(--accent)', error: 'var(--accent2)' };
  const icons  = { success: '✓',              warn: '⚠️',            error: '✕' };

  el.style.borderColor = colors[type];
  el.style.color       = colors[type];
  document.getElementById('t-icon').textContent = icons[type] || '✓';
  document.getElementById('t-msg').textContent  = msg;

  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}
