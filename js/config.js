// ============================================================
// Config Page — Cloudinary & Google Sheet settings
// ============================================================

function loadCfgInputs() {
  const config = DB.config;
  document.getElementById('cl-name').value   = config.cloudName    || '';
  document.getElementById('cl-preset').value = config.uploadPreset || '';
  document.getElementById('gs-url').value    = config.sheetUrl     || '';

  // Pre-fill One-line Config ด้วยค่าปัจจุบัน
  const oneline = [config.cloudName || '', config.uploadPreset || '', config.sheetUrl || ''].join(' | ');
  document.getElementById('oneline-cfg').value = oneline;

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

function copyOneline() {
  const config = DB.config;
  const oneline = [config.cloudName || '', config.uploadPreset || '', config.sheetUrl || ''].join('|');

  if (!config.cloudName && !config.uploadPreset && !config.sheetUrl) {
    toast('ยังไม่มีค่าที่จะ copy', 'warn');
    return;
  }

  navigator.clipboard.writeText(oneline).then(() => {
    toast('คัดลอก One-line Config แล้ว ✓');
    const btn = document.getElementById('copy-oneline-btn');
    if (btn) { btn.textContent = '✅ copied!'; setTimeout(() => { btn.textContent = '📋 Copy'; }, 1500); }
  }).catch(() => {
    // fallback สำหรับ browser ที่ไม่ support clipboard API
    const el = document.getElementById('oneline-cfg');
    el.value = oneline;
    el.select();
    document.execCommand('copy');
    toast('คัดลอก One-line Config แล้ว ✓');
  });
}

function saveCloud() {
  const cloudName    = document.getElementById('cl-name').value.trim();
  const uploadPreset = document.getElementById('cl-preset').value.trim();
  if (!cloudName || !uploadPreset) { toast('กรุณาใส่ทั้งสองช่อง', 'warn'); return; }

  DB.config.cloudName    = cloudName;
  DB.config.uploadPreset = uploadPreset;
  save();
  loadCfgInputs();
  document.getElementById('cl-st').textContent = '✓ บันทึกแล้ว';
  toast('บันทึก Cloudinary ✓');
}

function saveSheet() {
  const url = document.getElementById('gs-url').value.trim();
  if (!url) { toast('กรุณาใส่ URL', 'warn'); return; }

  DB.config.sheetUrl = url;
  save();
  loadCfgInputs();
  document.getElementById('gs-st').textContent = '✓ บันทึกแล้ว';
  toast('บันทึก Google Sheet ✓');
}
