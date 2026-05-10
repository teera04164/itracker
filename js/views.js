// ============================================================
// View Switching & Topbar
// ============================================================

function switchView(view) {
  curView = view;

  ['items', 'groups', 'config'].forEach(name => {
    document.getElementById('page-' + name).style.display = name === view ? 'block' : 'none';
    document.getElementById('nav-' + name).classList.toggle('active', name === view);
  });

  document.getElementById('add-btn').style.display = view === 'items' ? '' : 'none';
  updateTopbar();

  if (view === 'groups') renderGroups();
  if (view === 'config') { renderWsCfg(); loadCfgInputs(); }
}

function updateTopbar() {
  const ws = DB.workspaces.find(w => w.id === CWS);
  const titles = {
    items:  '📦 รายการของ',
    groups: '🗂 จัดการกลุ่ม',
    config: '⚙️ ตั้งค่า'
  };

  document.getElementById('tb-title').textContent = titles[curView] || '';
  document.getElementById('tb-ws').textContent    = ws ? `${ws.icon} ${ws.name}` : '';
}
