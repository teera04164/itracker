// ============================================================
// Google Sheets Sync
// ============================================================

async function syncToSheet(item) {
  const url = DB.config.sheetUrl;
  if (!url) return;

  try {
    const params = new URLSearchParams({
      action:    'add',
      id:        item.id,
      name:      item.name,
      location:  item.location,
      groupId:   item.groupId   || '',
      category:  item.category  || '',
      note:      item.note      || '',
      image:     item.image     || '',
      workspace: item.workspace,
      createdAt: item.createdAt
    });
    await fetch(`${url}?${params}`, { method: 'GET', mode: 'no-cors' });
  } catch (e) {}
}

async function delFromSheet(id) {
  const url = DB.config.sheetUrl;
  if (!url) return;
  try {
    await fetch(`${url}?action=delete&id=${id}`, { method: 'GET', mode: 'no-cors' });
  } catch (e) {}
}

async function loadFromSheet() {
  const url = DB.config.sheetUrl;
  if (!url) { toast('ยังไม่ได้ตั้งค่า Sheet URL', 'warn'); switchView('config'); return; }

  const btn = document.getElementById('sync-btn');
  btn.textContent = '⏳ ซิงค์...';
  btn.disabled    = true;
  toast('กำลังซิงค์...', 'warn');

  try {
    const res  = await fetch(`${url}?action=get&t=${Date.now()}`, { redirect: 'follow' });
    const text = await res.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (e) {
      toast('❌ Sheet ตอบกลับไม่ถูกต้อง', 'warn');
      btn.textContent = '🔄 ซิงค์';
      btn.disabled    = false;
      return;
    }

    const sheetItems = (data.items || []).filter(i => i.workspace === CWS || !i.workspace);
    const sheetIds   = new Set(sheetItems.map(i => String(i.id)));
    const localOnly  = wsItems().filter(i => !sheetIds.has(String(i.id)));

    for (const item of localOnly) await syncToSheet(item);

    const otherWorkspaces = DB.items.filter(i => i.workspace !== CWS);
    const merged = [
      ...sheetItems.map(i => ({ ...i, workspace: CWS })),
      ...localOnly
    ];
    merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    DB.items = [...otherWorkspaces, ...merged];
    save();
    renderItems();
    toast(`✓ ซิงค์สำเร็จ ${merged.length} รายการ (ใหม่ ${localOnly.length})`);
  } catch (e) {
    toast('❌ เชื่อมต่อ Sheet ไม่ได้', 'warn');
  }

  btn.textContent = '🔄 ซิงค์';
  btn.disabled    = false;
}
