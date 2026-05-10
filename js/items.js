// ============================================================
// Items — CRUD, Rendering & View Modal
// ============================================================

function wsItems() {
  return DB.items.filter(i => i.workspace === CWS);
}

// ---- Render ------------------------------------------------

function renderItems() {
  const query       = document.getElementById('search-input').value.toLowerCase();
  const filterGroup = document.getElementById('filter-group').value;
  const sortBy      = document.getElementById('sort-sel').value;

  let list = wsItems().filter(item => {
    const groupName  = DB.groups.find(g => g.id === item.groupId)?.name || '';
    const matchQuery = !query ||
      [item.name, item.location, item.category || '', groupName]
        .some(s => s.toLowerCase().includes(query));
    const matchGroup = !filterGroup ||
      (filterGroup === '__none__' ? !item.groupId : item.groupId === filterGroup);
    return matchQuery && matchGroup;
  });

  if (sortBy === 'old') list = [...list].reverse();
  else if (sortBy === 'az')  list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'th'));
  else if (sortBy === 'grp') list = [...list].sort((a, b) => (a.groupId || 'zzz').localeCompare(b.groupId || 'zzz'));
  else list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  document.getElementById('empty-st').style.display = list.length ? 'none' : 'block';
  if (!list.length) {
    document.getElementById('ungrouped-sec').innerHTML = '';
    document.getElementById('grouped-sec').innerHTML   = '';
    return;
  }

  const ungrouped = list.filter(i => !i.groupId);
  const byGroup   = {};
  list.filter(i => i.groupId).forEach(i => {
    if (!byGroup[i.groupId]) byGroup[i.groupId] = [];
    byGroup[i.groupId].push(i);
  });

  document.getElementById('ungrouped-sec').innerHTML = ungrouped.length ? `
    <div style="font-size:10px;font-weight:700;color:var(--muted);letter-spacing:0.5px;margin-bottom:8px;">
      ไม่มีกลุ่ม (${ungrouped.length})
    </div>
    <div class="items-grid" style="margin-bottom:18px;">${ungrouped.map(iCard).join('')}</div>
  ` : '';

  document.getElementById('grouped-sec').innerHTML = Object.entries(byGroup).map(([groupId, items]) => {
    const group = DB.groups.find(g => g.id === groupId) || { name: 'ไม่รู้จัก', icon: '❓' };
    return `
      <div class="group-card" style="margin-bottom:14px;">
        <div class="group-header" onclick="toggleGrp('${groupId}')">
          <div style="display:flex;align-items:center;gap:9px;">
            <span style="font-size:19px;">${group.icon}</span>
            <span style="font-weight:700;font-size:14px;">${esc(group.name)}</span>
            <span style="font-size:11px;color:var(--muted);">${items.length} ชิ้น</span>
          </div>
          <span id="cv-${groupId}" style="color:var(--muted);font-size:13px;transition:transform 0.2s;">▼</span>
        </div>
        <div id="gb-${groupId}" style="padding:12px 14px 14px;">
          <div class="items-grid">${items.map(iCard).join('')}</div>
        </div>
      </div>`;
  }).join('');
}

function toggleGrp(id) {
  const body    = document.getElementById('gb-' + id);
  const chevron = document.getElementById('cv-' + id);
  const isHidden = body.style.display === 'none';
  body.style.display     = isHidden ? '' : 'none';
  chevron.style.transform = isHidden ? '' : 'rotate(-90deg)';
}

function iCard(item) {
  const group = item.groupId ? DB.groups.find(g => g.id === item.groupId) : null;
  return `
    <div class="card fade-in" style="padding:13px;cursor:pointer;" onclick="viewItem('${item.id}')">
      ${item.image
        ? `<img src="${item.image}" class="item-img" style="margin-bottom:9px;" loading="lazy" alt="${esc(item.name)}">`
        : `<div class="item-ph" style="margin-bottom:9px;">📦</div>`}
      <div style="display:flex;align-items:start;justify-content:space-between;gap:5px;margin-bottom:5px;">
        <span style="font-weight:600;font-size:12px;line-height:1.4;flex:1;">${esc(item.name)}</span>
        ${item.category ? `<span class="tag" style="flex-shrink:0;font-size:10px;">${esc(item.category)}</span>` : ''}
      </div>
      ${group ? `<div style="margin-bottom:4px;"><span class="group-tag" style="font-size:10px;">${group.icon} ${esc(group.name)}</span></div>` : ''}
      <div class="loc-badge" style="margin-bottom:7px;">
        <span>📍</span>
        <span style="font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(item.location)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:10px;color:var(--muted);">${fmtDate(item.createdAt)}</span>
        <button class="btn btn-danger" style="padding:3px 9px;font-size:10px;"
          onclick="delItem(event,'${item.id}')">ลบ</button>
      </div>
    </div>`;
}

// ---- Add / Edit --------------------------------------------

function openAddModal(editItemId = null) {
  editId   = editItemId;
  selFile  = null;
  resetUpUI();
  renderGrpSel();

  document.getElementById('am-title').textContent = editItemId ? 'แก้ไขของ' : 'เพิ่มของใหม่';

  if (editItemId) {
    const item = DB.items.find(i => i.id === editItemId);
    document.getElementById('i-name').value  = item.name;
    document.getElementById('i-loc').value   = item.location;
    document.getElementById('i-grp').value   = item.groupId || '';
    document.getElementById('i-cat').value   = item.category || '';
    document.getElementById('i-note').value  = item.note || '';
    if (item.image) {
      document.getElementById('prev-img').src         = item.image;
      document.getElementById('up-ph').style.display  = 'none';
      document.getElementById('up-pv').style.display  = 'block';
    }
  } else {
    ['i-name', 'i-loc', 'i-cat', 'i-note'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('i-grp').value = '';
  }

  openModal('add-modal');
  setTimeout(() => document.getElementById('i-name').focus(), 300);
}

async function saveItem() {
  const name     = document.getElementById('i-name').value.trim();
  const location = document.getElementById('i-loc').value.trim();

  if (!name)     { shk('i-name'); toast('กรุณาใส่ชื่อของ', 'warn');  return; }
  if (!location) { shk('i-loc');  toast('กรุณาใส่ตำแหน่ง', 'warn'); return; }

  const btn = document.getElementById('save-btn');
  btn.disabled  = true;
  btn.innerHTML = '<span class="spinner"></span> กำลังบันทึก...';

  let image = editId ? (DB.items.find(i => i.id === editId)?.image || '') : '';
  if (selFile) image = await uploadImg(selFile) || image;

  const data = {
    name,
    location,
    image,
    groupId:  document.getElementById('i-grp').value,
    category: document.getElementById('i-cat').value.trim(),
    note:     document.getElementById('i-note').value.trim()
  };

  if (editId) {
    Object.assign(DB.items.find(i => i.id === editId), data);
  } else {
    const item = {
      id: Date.now().toString(),
      ...data,
      workspace: CWS,
      createdAt: new Date().toISOString()
    };
    DB.items.unshift(item);
    syncToSheet(item);
  }

  save();
  renderItems();
  closeModal('add-modal');
  toast(`${editId ? 'แก้ไข' : 'บันทึก'} "${name}" ✓`);

  editId        = null;
  btn.disabled  = false;
  btn.innerHTML = '💾 บันทึก';
}

function delItem(e, id) {
  e.stopPropagation();
  if (!confirm('ลบรายการนี้?')) return;
  DB.items = DB.items.filter(i => i.id !== id);
  save();
  delFromSheet(id);
  renderItems();
  toast('ลบแล้ว');
}

// ---- View Modal --------------------------------------------

function viewItem(id) {
  const item = DB.items.find(i => i.id === id);
  if (!item) return;

  viewId = id;
  document.getElementById('v-name').textContent = item.name;
  document.getElementById('v-loc').textContent  = item.location;

  const hasImage = !!item.image;
  document.getElementById('v-img').style.display = hasImage ? '' : 'none';
  document.getElementById('v-ph').style.display  = hasImage ? 'none' : '';
  if (hasImage) document.getElementById('v-img').src = item.image;

  const group = item.groupId ? DB.groups.find(g => g.id === item.groupId) : null;
  document.getElementById('v-grp-r').style.display = group ? '' : 'none';
  if (group) document.getElementById('v-grp').textContent = `${group.icon} ${group.name}`;

  document.getElementById('v-cat-r').style.display = item.category ? '' : 'none';
  if (item.category) document.getElementById('v-cat').textContent = item.category;

  document.getElementById('v-note-r').style.display = item.note ? '' : 'none';
  if (item.note) document.getElementById('v-note').textContent = item.note;

  document.getElementById('v-date').textContent = `บันทึกเมื่อ ${fmtDate(item.createdAt)}`;
  openModal('view-modal');
}

function editFromView() {
  closeModal('view-modal');
  setTimeout(() => openAddModal(viewId), 180);
}

function delFromView() {
  if (!confirm('ลบรายการนี้?')) return;
  DB.items = DB.items.filter(i => i.id !== viewId);
  save();
  delFromSheet(viewId);
  closeModal('view-modal');
  renderItems();
  toast('ลบแล้ว');
}
