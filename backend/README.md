# Google Apps Script Setup Guide

To save your scanned invoices to a Google Sheet, follow these steps:

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. Name it something like "My Expenses".

## Step 2: Open Apps Script

1. In the Google Sheet menu, click **Extensions** > **Apps Script**.
2. This opens a new tab with a code editor.

## Step 3: Add the Code

1. Delete any existing code in the `Code.gs` file.
2. Copy the content from the `Code.gs` file in this folder (or see below):

   ```javascript
   function doPost(e) {
     var lock = LockService.getScriptLock();
     lock.tryLock(10000);

     try {
       var rawData = e.postData.contents;
       var data = JSON.parse(rawData);
       var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

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
           "Buyer ID",
         ]);
       }

       var row = [
         new Date(),
         data.date,
         data.invoiceNumber,
         data.description,
         data.amount,
         data.taxAmount,
         data.totalAmount,
         data.sellerId,
         data.buyerId,
       ];

       sheet.appendRow(row);
       return ContentService.createTextOutput("Success").setMimeType(
         ContentService.MimeType.TEXT
       );
     } catch (error) {
       return ContentService.createTextOutput("Error").setMimeType(
         ContentService.MimeType.TEXT
       );
     } finally {
       lock.releaseLock();
     }
   }
   ```

3. Press **Save** (disk icon).

## Step 4: Deploy as Web App (Crucial!)

1. Click the blue **Deploy** button (top right) > **New deployment**.
2. Click the **Select type** (gear icon) > **Web app**.
3. Fill in the fields:
   - **Description**: "v1" (or anything).
   - **Execute as**: **Me** (your email).
   - **Who has access**: **Anyone** (This is important so your app can send data without login prompts).
4. Click **Deploy**.

## Step 5: Authorize Permissions

1. A window will pop up asking for permission. Click **Authorize access**.
2. Select your Google account.
3. You might see a "Google hasn’t verified this app" warning (because it's your own script).
   - Click **Advanced**.
   - Click **Go to (Project Name) (unsafe)**.
4. Click **Allow**.

## Step 6: Get the URL

1. Copy the **Web App URL**. It should look like `https://script.google.com/macros/s/.../exec`.
2. Go to your E-Invoice Scanner App (Part 1).
3. Click the **Settings (Gear Icon)**.
4. Paste this URL and save.

**Done!** Your app is now connected.
