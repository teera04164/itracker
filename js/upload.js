// ============================================================
// Image Upload — Cloudinary with Base64 fallback
// ============================================================

function b64(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

async function uploadImg(file) {
  const { cloudName, uploadPreset } = DB.config;
  if (!cloudName || !uploadPreset) return b64(file);

  document.getElementById('up-bar').style.display = 'block';
  document.getElementById('up-st').style.display  = 'block';
  document.getElementById('up-st').textContent    = 'กำลังอัพโหลด...';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  return new Promise(resolve => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    xhr.upload.onprogress = e => {
      if (e.lengthComputable) {
        document.getElementById('up-fill').style.width = Math.round(e.loaded / e.total * 100) + '%';
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        document.getElementById('up-st').textContent  = '✓ อัพโหลดสำเร็จ';
        document.getElementById('up-st').style.color  = 'var(--success)';
        resolve(res.secure_url);
      } else {
        document.getElementById('up-st').textContent = '⚠️ error — ใช้ Base64 แทน';
        b64(file).then(resolve);
      }
    };

    xhr.onerror = () => b64(file).then(resolve);
    xhr.send(formData);
  });
}

function setPreview(file) {
  if (!file) return;
  selFile = file;

  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('prev-img').src      = e.target.result;
    document.getElementById('up-ph').style.display  = 'none';
    document.getElementById('up-pv').style.display  = 'block';
    document.getElementById('up-fill').style.width  = '0%';
    document.getElementById('up-bar').style.display = 'none';
    document.getElementById('up-st').style.display  = 'none';
  };
  reader.readAsDataURL(file);
}

function handleDrop(e) {
  e.preventDefault();
  document.getElementById('upzone').classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file?.type.startsWith('image/')) setPreview(file);
}

function resetUpUI() {
  selFile = null;
  document.getElementById('file-inp').value        = '';
  document.getElementById('up-ph').style.display   = 'block';
  document.getElementById('up-pv').style.display   = 'none';
  document.getElementById('up-fill').style.width   = '0%';
  document.getElementById('up-bar').style.display  = 'none';
  document.getElementById('up-st').style.display   = 'none';
  document.getElementById('up-st').style.color     = 'var(--accent)';
}
