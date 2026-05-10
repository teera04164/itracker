const SHEET_NAME = 'Items';

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['ID', 'ชื่อของ', 'ตำแหน่ง', 'หมวดหมู่', 'หมายเหตุ', 'URL รูป', 'วันที่บันทึก']);
    sheet.getRange(1,1,1,7).setFontWeight('bold').setBackground('#f5a623').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  const action = e.parameter.action || 'get';
  const sheet = getOrCreateSheet();

  if (action === 'get') {
    const rows = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i][0]) continue;
      items.push({
        id: String(rows[i][0]),
        name: rows[i][1],
        location: rows[i][2],
        category: rows[i][3],
        note: rows[i][4],
        image: rows[i][5],
        createdAt: rows[i][6]
      });
    }
    return ContentService
      .createTextOutput(JSON.stringify({ items }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'add') {
    sheet.appendRow([
      e.parameter.id,
      e.parameter.name,
      e.parameter.location,
      e.parameter.category || '',
      e.parameter.note || '',
      e.parameter.image || '',
      e.parameter.createdAt
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'delete') {
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(e.parameter.id)) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ error: 'unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}