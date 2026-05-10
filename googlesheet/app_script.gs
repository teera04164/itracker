// ============================================================
// iTracker — Google Apps Script  (3 Sheets: Workspaces | Groups | Items)
// ============================================================

const S_ITEMS      = 'Items';
const S_GROUPS     = 'Groups';
const S_WORKSPACES = 'Workspaces';

// ---- Sheet bootstrap ----------------------------------------

function bootstrapSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold').setBackground('#f5a623').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getItemsSheet() {
  return bootstrapSheet(S_ITEMS,
    ['ID','ชื่อของ','ตำแหน่ง','หมวดหมู่','หมายเหตุ','URL รูป','วันที่บันทึก','groupId','workspace']);
}
function getGroupsSheet() {
  return bootstrapSheet(S_GROUPS,
    ['ID','ชื่อกลุ่ม','ไอคอน','คำอธิบาย','workspace','วันที่บันทึก']);
}
function getWorkspacesSheet() {
  return bootstrapSheet(S_WORKSPACES,
    ['ID','ชื่อ','ไอคอน','วันที่บันทึก']);
}

// ---- Utilities ----------------------------------------------

function colMap(sheet) {
  const h = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  const m = {};
  h.forEach(function(v, i) { if (v) m[String(v)] = i; });
  return m;
}

function rowsOf(sheet) {
  if (sheet.getLastRow() < 2) return [];
  return sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues();
}

function findRow(sheet, colIdx, id) {
  const rows = rowsOf(sheet);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][colIdx]) === String(id)) return i + 2;
  }
  return -1;
}

function genId() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 16);
}

// ---- Debug sheet log ----------------------------------------
function sheetLog(tag, msg) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let dbg = ss.getSheetByName('Debug');
    if (!dbg) {
      dbg = ss.insertSheet('Debug');
      dbg.appendRow(['Timestamp', 'Tag', 'Message']);
      dbg.getRange(1,1,1,3).setFontWeight('bold').setBackground('#333').setFontColor('#fff');
      dbg.setFrozenRows(1);
    }
    dbg.appendRow([new Date().toISOString(), tag, String(msg)]);
  } catch(e) {}
}

function ok(extra)  { return Object.assign({ success: true },  extra || {}); }
function err(reason) { return { success: false, reason: reason }; }

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---- doGet --------------------------------------------------

function doGet(e) {
  const p = e.parameter;
  const action = p.action || 'getAll';
  sheetLog('doGet', 'action=' + action + ' | params=' + JSON.stringify(p));
  try {
    if (action === 'getAll') {
      return jsonOut({ items: readItems(), groups: readGroups(), workspaces: readWorkspaces() });
    }
    if (action === 'addItem')         return jsonOut(addItem(p));
    if (action === 'updateItem')      return jsonOut(updateRecord(getItemsSheet(), p, {
      'ชื่อของ': p.name, 'ตำแหน่ง': p.location, 'หมวดหมู่': p.category,
      'หมายเหตุ': p.note, 'URL รูป': p.image, 'groupId': p.groupId, 'workspace': p.workspace
    }));
    if (action === 'deleteItem')      return jsonOut(deleteById(getItemsSheet(), p.id));
    if (action === 'addGroup')        return jsonOut(addGroup(p));
    if (action === 'updateGroup')     return jsonOut(updateRecord(getGroupsSheet(), p, {
      'ชื่อกลุ่ม': p.name, 'ไอคอน': p.icon, 'คำอธิบาย': p.desc
    }));
    if (action === 'deleteGroup')     return jsonOut(deleteById(getGroupsSheet(), p.id));
    if (action === 'addWorkspace')    return jsonOut(addWorkspace(p));
    if (action === 'deleteWorkspace') return jsonOut(deleteById(getWorkspacesSheet(), p.id));
    sheetLog('doGet', 'unknown action: ' + action);
    return jsonOut({ error: 'unknown action' });
  } catch (ex) {
    sheetLog('doGet', 'EXCEPTION: ' + ex.message);
    return jsonOut({ error: ex.message });
  }
}

// ---- Readers ------------------------------------------------

function readItems() {
  const sheet = getItemsSheet();
  const col = colMap(sheet);
  return rowsOf(sheet).filter(function(r) { return r[col['ID']]; }).map(function(r) {
    return {
      id:        String(r[col['ID']]),
      name:      r[col['ชื่อของ']]      || '',
      location:  r[col['ตำแหน่ง']]     || '',
      category:  r[col['หมวดหมู่']]    || '',
      note:      r[col['หมายเหตุ']]    || '',
      image:     r[col['URL รูป']]     || '',
      createdAt: r[col['วันที่บันทึก']] ? String(r[col['วันที่บันทึก']]) : '',
      groupId:   r[col['groupId']]      || '',
      workspace: r[col['workspace']]    || ''
    };
  });
}

function readGroups() {
  const sheet = getGroupsSheet();
  const col = colMap(sheet);
  return rowsOf(sheet).filter(function(r) { return r[col['ID']]; }).map(function(r) {
    return {
      id:        String(r[col['ID']]),
      name:      r[col['ชื่อกลุ่ม']]   || '',
      icon:      r[col['ไอคอน']]       || '🗂',
      desc:      r[col['คำอธิบาย']]    || '',
      workspace: r[col['workspace']]    || '',
      createdAt: r[col['วันที่บันทึก']] ? String(r[col['วันที่บันทึก']]) : ''
    };
  });
}

function readWorkspaces() {
  const sheet = getWorkspacesSheet();
  const col = colMap(sheet);
  return rowsOf(sheet).filter(function(r) { return r[col['ID']]; }).map(function(r) {
    return {
      id:        String(r[col['ID']]),
      name:      r[col['ชื่อ']]         || '',
      icon:      r[col['ไอคอน']]        || '🏢',
      createdAt: r[col['วันที่บันทึก']] ? String(r[col['วันที่บันทึก']]) : ''
    };
  });
}

// ---- Item CRUD ----------------------------------------------

function addItem(p) {
  const sheet = getItemsSheet();
  const col = colMap(sheet);
  const id = p.id || genId();
  if (findRow(sheet, col['ID'], id) > 0) return err('duplicate id');
  const row = new Array(sheet.getLastColumn()).fill('');
  row[col['ID']]            = id;
  row[col['ชื่อของ']]      = p.name      || '';
  row[col['ตำแหน่ง']]     = p.location  || '';
  row[col['หมวดหมู่']]    = p.category  || '';
  row[col['หมายเหตุ']]    = p.note       || '';
  row[col['URL รูป']]     = p.image      || '';
  row[col['วันที่บันทึก']] = p.createdAt || new Date().toISOString();
  row[col['groupId']]      = p.groupId   || '';
  row[col['workspace']]    = p.workspace || '';
  sheet.appendRow(row);
  return ok({ id: id });
}

// ---- Group CRUD ---------------------------------------------

function addGroup(p) {
  sheetLog('addGroup', 'params: ' + JSON.stringify(p));
  const sheet = getGroupsSheet();
  const col = colMap(sheet);
  sheetLog('addGroup', 'colMap: ' + JSON.stringify(col));
  const id = p.id || genId();
  sheetLog('addGroup', 'id: ' + id);
  const dupRow = findRow(sheet, col['ID'], id);
  if (dupRow > 0) {
    sheetLog('addGroup', 'DUPLICATE at row ' + dupRow);
    return err('duplicate id');
  }
  const row = new Array(sheet.getLastColumn()).fill('');
  row[col['ID']]             = id;
  row[col['ชื่อกลุ่ม']]   = p.name      || '';
  row[col['ไอคอน']]       = p.icon       || '🗂';
  row[col['คำอธิบาย']]    = p.desc       || '';
  row[col['workspace']]     = p.workspace  || '';
  row[col['วันที่บันทึก']] = p.createdAt || new Date().toISOString();
  sheetLog('addGroup', 'row: ' + JSON.stringify(row));
  sheet.appendRow(row);
  sheetLog('addGroup', '✅ done, id=' + id);
  return ok({ id: id });
}

// ---- Workspace CRUD -----------------------------------------

function addWorkspace(p) {
  const sheet = getWorkspacesSheet();
  const col = colMap(sheet);
  const id = p.id || genId();
  if (findRow(sheet, col['ID'], id) > 0) return err('duplicate id');
  const row = new Array(sheet.getLastColumn()).fill('');
  row[col['ID']]            = id;
  row[col['ชื่อ']]         = p.name      || '';
  row[col['ไอคอน']]       = p.icon       || '🏢';
  row[col['วันที่บันทึก']] = p.createdAt || new Date().toISOString();
  sheet.appendRow(row);
  return ok({ id: id });
}

// ---- Generic helpers ----------------------------------------

function updateRecord(sheet, p, fields) {
  const col = colMap(sheet);
  const rowIdx = findRow(sheet, col['ID'], p.id);
  if (rowIdx < 0) return err('not found');
  Object.keys(fields).forEach(function(key) {
    if (fields[key] !== undefined && col[key] !== undefined) {
      sheet.getRange(rowIdx, col[key] + 1).setValue(fields[key] || '');
    }
  });
  return ok();
}

function deleteById(sheet, id) {
  if (!id) return err('no id');
  const col = colMap(sheet);
  const rowIdx = findRow(sheet, col['ID'], id);
  if (rowIdx < 0) return err('not found');
  sheet.deleteRow(rowIdx);
  return ok();
}