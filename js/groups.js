// ============================================================
// Groups — CRUD & Rendering
// ============================================================

function wsGrps() {
  return DB.groups.filter(g => g.workspace === CWS);
}

function openGroupModal(editGroupId = null) {
  document.getElementById('g-edit-id').value = editGroupId || '';

  if (editGroupId) {
    const group = DB.groups.find(g => g.id === editGroupId);
    document.getElementById('gm-title').textContent = 'แก้ไขกลุ่ม';
    document.getElementById('g-name').value = group.name;
    document.getElementById('g-icon').value = group.icon || '🗂';
    document.getElementById('g-desc').value = group.desc || '';
  } else {
    document.getElementById('gm-title').textContent = 'สร้างกลุ่ม';
    document.getElementById('g-name').value = '';
    document.getElementById('g-icon').value = '🗂';
    document.getElementById('g-desc').value = '';
  }

  openModal('grp-modal');
}

function saveGroup() {
  const name        = document.getElementById('g-name').value.trim();
  const icon        = document.getElementById('g-icon').value.trim() || '🗂';
  const desc        = document.getElementById('g-desc').value.trim();
  const editGroupId = document.getElementById('g-edit-id').value;

  if (!name) { toast('กรุณาใส่ชื่อกลุ่ม', 'warn'); return; }

  if (editGroupId) {
    const group = DB.groups.find(g => g.id === editGroupId);
    if (group) { group.name = name; group.icon = icon; group.desc = desc; }
  } else {
    DB.groups.push({ id: 'g' + Date.now(), name, icon, desc, workspace: CWS });
  }

  save();
  closeModal('grp-modal');
  renderGroups();
  renderGrpSel();
  toast(`${editGroupId ? 'แก้ไข' : 'สร้าง'}กลุ่ม "${name}" ✓`);
}

function delGrp(id) {
  const group = DB.groups.find(g => g.id === id);
  if (!confirm(`ลบกลุ่ม "${group?.name}"? ของจะถูกย้ายออกจากกลุ่ม`)) return;

  DB.groups = DB.groups.filter(g => g.id !== id);
  DB.items.forEach(item => { if (item.groupId === id) item.groupId = ''; });

  save();
  renderGroups();
  renderGrpSel();
  renderItems();
  toast('ลบกลุ่มแล้ว');
}

function renderGroups() {
  const groups = wsGrps();
  document.getElementById('groups-empty').style.display = groups.length ? 'none' : 'block';
  document.getElementById('groups-list').innerHTML = groups.map(group => {
    const count = DB.items.filter(i => i.groupId === group.id && i.workspace === CWS).length;
    return `
      <div class="group-card fade-in">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:13px 16px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:20px;">${group.icon}</span>
            <div>
              <div style="font-weight:600;font-size:14px;">${esc(group.name)}</div>
              ${group.desc ? `<div style="font-size:11px;color:var(--muted);">${esc(group.desc)}</div>` : ''}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:7px;">
            <span style="font-size:11px;color:var(--muted);">${count} ชิ้น</span>
            <button onclick="openGroupModal('${group.id}')" class="btn btn-ghost" style="padding:5px 10px;font-size:11px;">✏️</button>
            <button onclick="delGrp('${group.id}')" class="btn btn-danger" style="padding:5px 10px;font-size:11px;">🗑</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

function renderGrpSel() {
  const groups  = wsGrps();
  const options = groups.map(g => `<option value="${g.id}">${g.icon} ${esc(g.name)}</option>`).join('');

  document.getElementById('i-grp').innerHTML =
    `<option value="">ไม่มีกลุ่ม</option>${options}`;

  document.getElementById('filter-group').innerHTML =
    `<option value="">ทุกกลุ่ม</option><option value="__none__">ไม่มีกลุ่ม</option>${options}`;
}
