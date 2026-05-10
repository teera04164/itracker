// ============================================================
// State & Persistence
// ============================================================

const DB_KEY    = 'itk-v3';
const DB_V2_KEY = 'item-tracker-v2';

const DB_DEFAULTS = {
  workspaces: [{ id: 'ws0', name: 'Default', icon: '🏠' }],
  currentWs: 'ws0',
  items: [],
  groups: [],
  config: { cloudName: '', uploadPreset: '', sheetUrl: '' }
};

let DB = loadDB();

// Active workspace ID, current view, and transient edit/upload state
let CWS      = DB.currentWs;
let curView  = 'items';
let viewId   = null;
let editId   = null;
let selFile  = null;

function loadDB() {
  try {
    const stored = JSON.parse(localStorage.getItem(DB_KEY) || 'null');

    if (!stored) {
      // Migrate from v2 schema
      const v2Items = JSON.parse(localStorage.getItem(DB_V2_KEY) || '[]');
      if (v2Items.length) {
        DB_DEFAULTS.items = v2Items.map(item => ({ ...item, workspace: 'ws0', groupId: '' }));
      }
      return DB_DEFAULTS;
    }

    return {
      ...DB_DEFAULTS,
      ...stored,
      config: { ...DB_DEFAULTS.config, ...(stored.config || {}) }
    };
  } catch (e) {
    return DB_DEFAULTS;
  }
}

function save() {
  DB.currentWs = CWS;
  localStorage.setItem(DB_KEY, JSON.stringify(DB));
}
