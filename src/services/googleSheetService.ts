import type { ParsedInvoice } from '../utils/invoiceParser';

export const uploadToSheet = async (data: ParsedInvoice, scriptUrl: string): Promise<boolean> => {
  try {
    // Determine if we should use no-cors or standard.
    // Google Apps Script Web App usually requires 'no-cors' if triggering from browser 
    // AND it doesn't return CORS headers unless outputting JSON properly with specific setup.
    // However, to GET information back (like "success"), we need CORS.
    // For appending data, 'no-cors' is often safest to avoid errors, but we won't know if it failed.
    // Strategy: Try text/plain content-type which avoids preflight (Simple Request).
    
    // We'll wrap the data in a structure expected by the backend
    const payload = JSON.stringify(data);

    await fetch(scriptUrl, {
      method: "POST",
      mode: "no-cors", // Crucial for GAS Web App calls from browser
      headers: {
        "Content-Type": "text/plain", // Avoids OPTIONS preflight
      },
      body: payload,
    });

    // Since mode is no-cors, we can't read the response properly to check 200 OK.
    // We assume success if no network error threw.
    return true;
  } catch (error) {
    console.error("Upload failed", error);
    return false;
  }
};
