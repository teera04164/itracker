const SHEET_NAME = 'Items';

// Columns: ID | ชื่อของ | ตำแหน่ง | หมวดหมู่ | หมายเหตุ | URL รูป | วันที่บันทึก | groupId | workspace
const HEADERS = ['ID', 'ชื่อของ', 'ตำแหน่ง', 'หมวดหมู่', 'หมายเหตุ', 'URL รูป', 'วันที่บันทึก', 'groupId', 'workspace'];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#f5a623')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  } else {
    // Migration: เพิ่ม columns ถ้า sheet เก่ายังไม่มี groupId / workspace
    const header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (!header.includes('groupId')) {
      const nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue('groupId').setFontWeight('bold').setBackground('#f5a623').setFontColor('#ffffff');
    }
    if (!header.includes('workspace')) {
      const nextCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, nextCol).setValue('workspace').setFontWeight('bold').setBackground('#f5a623').setFontColor('#ffffff');
    }
  }
  return sheet;
}

// หา index ของแต่ละ column จาก header row (รองรับทั้ง sheet เก่าและใหม่)
function getColIndex(header) {
  return {
    id:        header.indexOf('ID'),
    name:      header.indexOf('ชื่อของ'),
    location:  header.indexOf('ตำแหน่ง'),
    category:  header.indexOf('หมวดหมู่'),
    note:      header.indexOf('หมายเหตุ'),
    image:     header.indexOf('URL รูป'),
    createdAt: header.indexOf('วันที่บันทึก'),
    groupId:   header.indexOf('groupId'),
    workspace: header.indexOf('workspace')
  };
}

function doGet(e) {
  const action = e.parameter.action || 'get';
  const sheet  = getOrCreateSheet();
  const rows   = sheet.getDataRange().getValues();
  const header = rows[0];
  const col    = getColIndex(header);

  // ---- GET ------------------------------------------------
  if (action === 'get') {
    const items = [];
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i][col.id]) continue;
      items.push({
        id:        String(rows[i][col.id]),
        name:      rows[i][col.name]      || '',
        location:  rows[i][col.location]  || '',
        category:  rows[i][col.category]  || '',
        note:      rows[i][col.note]       || '',
        image:     rows[i][col.image]      || '',
        createdAt: rows[i][col.createdAt]  || '',
        groupId:   col.groupId   >= 0 ? (rows[i][col.groupId]   || '') : '',
        workspace: col.workspace >= 0 ? (rows[i][col.workspace] || '') : ''
      });
    }
    return ContentService
      .createTextOutput(JSON.stringify({ items }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ---- ADD ------------------------------------------------
  if (action === 'add') {
    // ตรวจสอบว่า ID ซ้ำหรือไม่ก่อน append
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][col.id]) === String(e.parameter.id)) {
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, reason: 'duplicate id' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    const newRow = new Array(sheet.getLastColumn()).fill('');
    newRow[col.id]        = e.parameter.id        || '';
    newRow[col.name]      = e.parameter.name       || '';
    newRow[col.location]  = e.parameter.location   || '';
    newRow[col.category]  = e.parameter.category   || '';
    newRow[col.note]      = e.parameter.note        || '';
    newRow[col.image]     = e.parameter.image       || '';
    newRow[col.createdAt] = e.parameter.createdAt  || '';
    if (col.groupId   >= 0) newRow[col.groupId]   = e.parameter.groupId   || '';
    if (col.workspace >= 0) newRow[col.workspace]  = e.parameter.workspace || '';

    sheet.appendRow(newRow);
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ---- UPDATE ---------------------------------------------
  if (action === 'update') {
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][col.id]) === String(e.parameter.id)) {
        const r = i + 1; // 1-indexed
        if (e.parameter.name)      sheet.getRange(r, col.name      + 1).setValue(e.parameter.name);
        if (e.parameter.location)  sheet.getRange(r, col.location  + 1).setValue(e.parameter.location);
        if (e.parameter.category !== undefined) sheet.getRange(r, col.category  + 1).setValue(e.parameter.category  || '');
        if (e.parameter.note      !== undefined) sheet.getRange(r, col.note      + 1).setValue(e.parameter.note       || '');
        if (e.parameter.image     !== undefined) sheet.getRange(r, col.image     + 1).setValue(e.parameter.image      || '');
        if (col.groupId   >= 0 && e.parameter.groupId   !== undefined) sheet.getRange(r, col.groupId   + 1).setValue(e.parameter.groupId   || '');
        if (col.workspace >= 0 && e.parameter.workspace !== undefined) sheet.getRange(r, col.workspace + 1).setValue(e.parameter.workspace || '');
        return ContentService
          .createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, reason: 'id not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ---- DELETE ---------------------------------------------
  if (action === 'delete') {
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][col.id]) === String(e.parameter.id)) {
        sheet.deleteRow(i + 1);
        return ContentService
          .createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, reason: 'id not found' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ error: 'unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}