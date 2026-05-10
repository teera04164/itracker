// ============================================================
// Config Page — Cloudinary & Google Sheet settings
// ============================================================

function loadCfgInputs() {
  const config = DB.config;
  document.getElementById('cl-name').value   = config.cloudName    || '';
  document.getElementById('cl-preset').value = config.uploadPreset || '';
  document.getElementById('gs-url').value    = config.sheetUrl     || '';
  updDots();
}

function updDots() {
  const config   = DB.config;
  const cloudOk  = config.cloudName && config.uploadPreset;
  document.getElementById('cl-dot').style.background = cloudOk          ? 'var(--success)' : 'var(--border)';
  document.getElementById('gs-dot').style.background = config.sheetUrl  ? 'var(--success)' : 'var(--border)';
}

function applyOneline() {
  const value = document.getElementById('oneline-cfg').value.trim();
  const parts = value.split('|').map(s => s.trim());

  if (parts.length < 3 || !parts[2].startsWith('http')) {
    toast('รูปแบบไม่ถูกต้อง — ต้องมี 3 ส่วนคั่น |', 'warn');
    return;
  }

  DB.config = { cloudName: parts[0], uploadPreset: parts[1], sheetUrl: parts[2] };
  save();
  loadCfgInputs();
  document.getElementById('oneline-st').textContent = `✓ ตั้งค่าสำเร็จ: ${parts[0]} | preset: ${parts[1]}`;
  toast('One-line Config สำเร็จ ✓');
}

function saveCloud() {
  const cloudName    = document.getElementById('cl-name').value.trim();
  const uploadPreset = document.getElementById('cl-preset').value.trim();
  if (!cloudName || !uploadPreset) { toast('กรุณาใส่ทั้งสองช่อง', 'warn'); return; }

  DB.config.cloudName    = cloudName;
  DB.config.uploadPreset = uploadPreset;
  save();
  updDots();
  document.getElementById('cl-st').textContent = '✓ บันทึกแล้ว';
  toast('บันทึก Cloudinary ✓');
}

function saveSheet() {
  const url = document.getElementById('gs-url').value.trim();
  if (!url) { toast('กรุณาใส่ URL', 'warn'); return; }

  DB.config.sheetUrl = url;
  save();
  updDots();
  document.getElementById('gs-st').textContent = '✓ บันทึกแล้ว';
  toast('บันทึก Google Sheet ✓');
}
