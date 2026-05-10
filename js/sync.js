// ============================================================
// Google Sheets Sync  (Items + Groups + Workspaces)
// ============================================================

// ---- Fire-and-forget helpers --------------------------------

function sheetPost(action, params) {
  const url = DB.config.sheetUrl;
  console.log('[sheetPost] action:', action, '| url:', url || '(empty!)');
  if (!url) { console.warn('[sheetPost] ❌ sheetUrl ว่าง — ไม่ได้ตั้งค่า'); return; }
  try {
    const p = new URLSearchParams(Object.assign({ action }, params));
    const fullUrl = `${url}?${p}`;
    console.log('[sheetPost] 🚀 sending:', fullUrl);
    fetch(fullUrl, { method: 'GET', mode: 'no-cors' })
      .then(() => console.log('[sheetPost] ✅ fired (no-cors)'))
      .catch(e => console.error('[sheetPost] ❌ fetch error:', e));
  } catch (e) { console.error('[sheetPost] ❌ exception:', e); }
}

// ---- Items --------------------------------------------------

async function syncToSheet(item) {
  sheetPost('addItem', {
    id:        item.id,
    name:      item.name,
    location:  item.location,
    groupId:   item.groupId   || '',
    category:  item.category  || '',
    note:      item.note      || '',
    image:     item.image     || '',
    workspace: item.workspace || '',
    createdAt: item.createdAt
  });
}

async function updateItemOnSheet(item) {
  sheetPost('updateItem', {
    id:        item.id,
    name:      item.name,
    location:  item.location,
    groupId:   item.groupId   || '',
    category:  item.category  || '',
    note:      item.note      || '',
    image:     item.image     || '',
    workspace: item.workspace || ''
  });
}

async function delFromSheet(id) {
  sheetPost('deleteItem', { id });
}

// ---- Groups -------------------------------------------------

function syncGroupToSheet(group) {
  console.log('[syncGroupToSheet] 📤 payload:', group);
  sheetPost('addGroup', {
    id:        group.id,
    name:      group.name,
    icon:      group.icon     || '🗂',
    desc:      group.desc     || '',
    workspace: group.workspace || ''
  });
}

function updateGroupOnSheet(group) {
  sheetPost('updateGroup', {
    id:   group.id,
    name: group.name,
    icon: group.icon || '🗂',
    desc: group.desc || ''
  });
}

function delGroupFromSheet(id) {
  sheetPost('deleteGroup', { id });
}

// ---- Workspaces ---------------------------------------------

function syncWorkspaceToSheet(ws) {
  sheetPost('addWorkspace', {
    id:   ws.id,
    name: ws.name,
    icon: ws.icon || '🏢'
  });
}

function delWorkspaceFromSheet(id) {
  sheetPost('deleteWorkspace', { id });
}

// ---- Full sync (load) ---------------------------------------

async function loadFromSheet() {
  const url = DB.config.sheetUrl;
  if (!url) { toast('ยังไม่ได้ตั้งค่า Sheet URL', 'warn'); switchView('config'); return; }

  const btn = document.getElementById('sync-btn');
  btn.textContent = '⏳ ซิงค์...';
  btn.disabled    = true;
  toast('กำลังซิงค์...', 'warn');

  try {
    const res  = await fetch(`${url}?action=getAll&t=${Date.now()}`, { redirect: 'follow' });
    const text = await res.text();
    let data;

    try { data = JSON.parse(text); }
    catch (e) {
      toast('❌ Sheet ตอบกลับไม่ถูกต้อง', 'warn');
      btn.textContent = '🔄 ซิงค์'; btn.disabled = false;
      return;
    }

    // ---- Workspaces merge -----------------------------------
    const sheetWs    = data.workspaces || [];
    const sheetWsIds = new Set(sheetWs.map(w => w.id));
    const localOnlyWs = DB.workspaces.filter(w => !sheetWsIds.has(w.id));
    localOnlyWs.forEach(w => syncWorkspaceToSheet(w));
    DB.workspaces = [...sheetWs, ...localOnlyWs];
    if (!DB.workspaces.length) DB.workspaces = [{ id: 'ws0', name: 'Default', icon: '🏠' }];

    // Make sure CWS is valid
    if (!DB.workspaces.find(w => w.id === CWS)) CWS = DB.workspaces[0].id;

    // ---- Groups merge ---------------------------------------
    const sheetGrps    = data.groups || [];
    const sheetGrpIds  = new Set(sheetGrps.map(g => g.id));
    const localOnlyGrps = DB.groups.filter(g => !sheetGrpIds.has(g.id));
    localOnlyGrps.forEach(g => syncGroupToSheet(g));
    DB.groups = [...sheetGrps, ...localOnlyGrps];

    // ---- Items merge ----------------------------------------
    const sheetItems  = data.items || [];
    const sheetIds    = new Set(sheetItems.map(i => String(i.id)));
    const localOnly   = DB.items.filter(i => !sheetIds.has(String(i.id)));
    for (const item of localOnly) await syncToSheet(item);

    const merged = [...sheetItems, ...localOnly];
    merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    DB.items = merged;

    save();
    renderAll();

    const newItemsCount = localOnly.length;
    toast(`✓ ซิงค์สำเร็จ — ${merged.length} ของ, ${DB.groups.length} กลุ่ม, ${DB.workspaces.length} workspace (อัพโหลดใหม่ ${newItemsCount})`);

  } catch (e) {
    toast('❌ เชื่อมต่อ Sheet ไม่ได้', 'warn');
  }

  btn.textContent = '🔄 ซิงค์';
  btn.disabled    = false;
}
