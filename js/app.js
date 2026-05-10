// ============================================================
// Bootstrap — entry point, loaded last
// ============================================================

function renderAll() {
  renderWsList();
  renderWsCfg();
  updateTopbar();
  renderItems();
  renderGroups();
  renderGrpSel();
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.innerWidth <= 768) {
    document.getElementById('sb-close').style.display = 'block';
  }
  loadCfgInputs();
  renderAll();
});
