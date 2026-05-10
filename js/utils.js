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
    closeEmojiPicker();
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

// ============================================================
// Emoji Picker
// ============================================================

const EMOJI_LIST = [
  // กล่อง / เก็บของ
  '📦','🗃️','🗄️','🧺','🧳','👜','💼','🎒','🪣','🛒',
  // บ้าน / สถานที่
  '🏠','🏢','🏪','🏭','🚗','🚐','🏕️','🛖','🏬','🏗️',
  // เครื่องมือ
  '🔧','🔨','⚙️','🪛','🔩','🪚','🪜','🧲','🔌','💡',
  // เสื้อผ้า
  '👕','👗','🧥','👟','👒','🎩','🧣','🧤',
  // อาหาร / ครัว
  '🍳','🥘','🍵','🧃','🧂','🫙','🥄','🍽️',
  // อิเล็กทรอนิกส์
  '💻','📱','📷','🎮','🎧','📺','🖨️','⌚',
  // หนังสือ / ออฟฟิศ
  '📚','📁','📂','🗂️','📋','📌','✏️','🖊️','📎','🗒️',
  // กีฬา
  '⚽','🏀','🎾','🏈','🎯','🏋️','🧘','🚴',
  // ธรรมชาติ / พืช
  '🌱','🌸','🌿','🍀','🌵','🎋','🪴','🌲',
  // สัญลักษณ์
  '⭐','🔥','💎','❤️','🎯','🏆','🎖️','🔖','💰','🪙',
];

let _emojiTarget = null;

function openEmojiPicker(inputId, triggerEl) {
  _emojiTarget = inputId;
  let picker = document.getElementById('emoji-picker');

  if (!picker) {
    picker = document.createElement('div');
    picker.id = 'emoji-picker';
    picker.style.cssText = [
      'position:fixed;z-index:9999;background:var(--card);border:1px solid var(--border);',
      'border-radius:12px;padding:10px;box-shadow:0 8px 32px rgba(0,0,0,0.4);',
      'display:grid;grid-template-columns:repeat(8,1fr);gap:4px;',
      'max-width:280px;max-height:220px;overflow-y:auto;'
    ].join('');
    document.body.appendChild(picker);

    // Event delegation — ใช้ index เพื่อหลีกเลี่ยงปัญหา special chars ใน attribute
    picker.addEventListener('click', function(ev) {
      ev.stopPropagation();
      const btn = ev.target.closest('button[data-ei]');
      if (btn) pickEmoji(EMOJI_LIST[parseInt(btn.dataset.ei)]);
    });
  }

  picker.innerHTML = EMOJI_LIST.map(function(e, i) {
    return `<button data-ei="${i}" title="${e}"
      style="background:none;border:none;cursor:pointer;font-size:20px;padding:4px;
             border-radius:6px;line-height:1;transition:background 0.15s;"
      onmouseover="this.style.background='var(--border)'"
      onmouseout="this.style.background='none'">${e}</button>`;
  }).join('');

  const rect = triggerEl.getBoundingClientRect();
  const top  = rect.bottom + 6;
  const left = Math.min(rect.left, window.innerWidth - 295);
  picker.style.top  = top  + 'px';
  picker.style.left = left + 'px';
  picker.style.display = 'grid';

  setTimeout(() => {
    document.addEventListener('click', _closePickerOutside, { once: true });
  }, 10);
}

function pickEmoji(emoji) {
  if (_emojiTarget) {
    document.getElementById(_emojiTarget).value = emoji;
  }
  closeEmojiPicker();
}

function closeEmojiPicker() {
  const picker = document.getElementById('emoji-picker');
  if (picker) picker.style.display = 'none';
  document.removeEventListener('click', _closePickerOutside);
}

function _closePickerOutside(e) {
  const picker = document.getElementById('emoji-picker');
  if (picker && !picker.contains(e.target)) {
    closeEmojiPicker();
  }
}
