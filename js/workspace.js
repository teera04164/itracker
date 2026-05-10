// ============================================================
// Workspace Management & Sidebar
// ============================================================

function renderWsList() {
  document.getElementById('ws-list').innerHTML = DB.workspaces.map(ws => `
    <div class="ws-item ${ws.id === CWS ? 'active' : ''}" onclick="switchWs('${ws.id}')">
      <span style="font-size:13px;">${ws.icon || '🏢'}</span>
      <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(ws.name)}</span>
    </div>
  `).join('');
}

function switchWs(id) {
  CWS = id;
  save();
  renderAll();
  closeSidebar();
}

function saveWs() {
  const name = document.getElementById('ws-name-input').value.trim();
  const icon = document.getElementById('ws-icon-input').value.trim() || '🏢';
  if (!name) { toast('กรุณาใส่ชื่อ', 'warn'); return; }

  const id = 'ws' + Date.now();
  DB.workspaces.push({ id, name, icon });
  CWS = id;
  save();
  closeModal('ws-modal');
  renderAll();
  toast(`สร้าง "${name}" แล้ว ✓`);
}

function delWs(id) {
  const ws    = DB.workspaces.find(w => w.id === id);
  const count = DB.items.filter(i => i.workspace === id).length;
  if (!confirm(`ลบ "${ws?.name}"? มีของ ${count} ชิ้น`)) return;

  DB.workspaces = DB.workspaces.filter(w => w.id !== id);
  DB.items      = DB.items.filter(i => i.workspace !== id);
  DB.groups     = DB.groups.filter(g => g.workspace !== id);
  if (CWS === id) CWS = DB.workspaces[0]?.id || 'ws0';

  save();
  renderAll();
  toast('ลบ Workspace แล้ว');
}

function renderWsCfg() {
  document.getElementById('ws-cfg').innerHTML = DB.workspaces.map(ws => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 12px;background:rgba(255,255,255,0.04);border-radius:9px;">
      <span style="font-size:13px;">${ws.icon} ${esc(ws.name)}</span>
      <div style="display:flex;gap:6px;align-items:center;">
        ${ws.id === CWS
          ? '<span style="font-size:10px;color:var(--success);background:rgba(107,203,119,0.1);padding:2px 8px;border-radius:20px;">ใช้งานอยู่</span>'
          : ''}
        ${DB.workspaces.length > 1 && ws.id !== 'ws0'
          ? `<button onclick="delWs('${ws.id}')" class="btn btn-danger" style="padding:3px 9px;font-size:11px;">ลบ</button>`
          : ''}
      </div>
    </div>
  `).join('');
}

// ---- Sidebar Toggle ----------------------------------------

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('open');
    document.getElementById('sb-ov').classList.toggle('show');
  } else {
    sidebar.classList.toggle('collapsed');
    document.getElementById('main').classList.toggle('expanded');
  }
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sb-ov').classList.remove('show');
}
