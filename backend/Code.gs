function doPost(e) {
  // Lock to prevent concurrent edits messing up the appending (optional but good practice)
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    // 1. Parsing the data
    // The frontend sends raw JSON string but with Content-Type: text/plain to avoid preflight options.
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);

    // 2. Open the Spreadsheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // 3. Setup Header if not exists (Optional)
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", 
        "Date", 
        "Invoice Number", 
        "Random Code", 
        "Sales Amount", 
        "Tax Amount", 
        "Total Amount", 
        "Seller ID", 
        "Buyer ID"
      ]);
    }

    // 4. Prepare the row
    var row = [
      new Date(), // Timestamp
      data.date,
      data.invoiceNumber,
      data.description, // Random Code
      data.amount,      // Before Tax
      data.taxAmount,
      data.totalAmount, // Final Price
      data.sellerId,
      data.buyerId
    ];

    // 5. Append Row
    sheet.appendRow(row);

    // 6. Return Success Response
    // We return text/plain to satisfy the browser's no-cors or simple request requirements
    return ContentService.createTextOutput("Success").setMimeType(ContentService.MimeType.TEXT);

  } catch (error) {
    // Log error for debugging in GAS
    console.error(error);
    return ContentService.createTextOutput("Error: " + error.toString()).setMimeType(ContentService.MimeType.TEXT);
    
  } finally {
    lock.releaseLock();
  }
}
