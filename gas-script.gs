function doPost(e) {
  // 1. 處理 CORS 預檢請求
  if (e.parameter === undefined && e.postData === undefined) {
    return ContentService.createTextOutput("Success")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  // 2. 獲取試算表，請將這裡替換成你的 Google Sheet ID
  var sheetId = '1IY64b8Gq7F4UP41jlBAS4yyvg3Lq8F8Mj3-9jNGniu0'; 
  var sheetName = '冒險紀錄'; // 確保你的試算表有這個工作表名稱
  
  try {
    var doc = SpreadsheetApp.openById(sheetId);
    var sheet = doc.getSheetByName(sheetName);
    
    // 如果工作表不存在，自動建立並寫入標題
    if (!sheet) {
      sheet = doc.insertSheet(sheetName);
      sheet.appendRow(['時間戳記', 'User ID', '居住地', '抽中結果']);
    }

    // 3. 取得前端傳過來的資料 (使用 x-www-form-urlencoded)
    var userId = e.parameter.userId || "Unknown";
    var userCity = e.parameter.userCity || "Unknown";
    var resultText = e.parameter.resultText || "Unknown";
    var timestamp = e.parameter.timestamp || new Date().toISOString();

    // 4. 寫入新資料到最後一列
    sheet.appendRow([timestamp, userId, userCity, resultText]);

    // 5. 回傳成功訊息
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 支援 GET 測試
function doGet(e) {
  return ContentService.createTextOutput("請使用 POST 方法傳送紀錄資料。")
    .setMimeType(ContentService.MimeType.TEXT);
}
