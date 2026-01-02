export interface ParsedInvoice {
  invoiceNumber: string;
  date: string; // YYYY-MM-DD
  description: string; // Random code
  amount: number; // Sales amount (pre-tax)
  totalAmount: number; // Tax included
  buyerId: string;
  sellerId: string;
  taxAmount: number;
}

export const parseInvoice = (rawString: string): ParsedInvoice | null => {
  // Basic validation: Length check (standard is usually 77+ for full data, but specific QR might vary)
  if (!rawString || rawString.length < 77) {
    console.warn("Invalid QR code length:", rawString.length);
    return null;
  }

  try {
    // 1. Invoice Number (10 chars, Index 0-10)
    const invoiceNumber = rawString.substring(0, 10);

    // 2. Date (7 chars, Index 10-17) - Format: YYYMMDD (ROC Year)
    const dateStr = rawString.substring(10, 17);
    const rocYear = parseInt(dateStr.substring(0, 3), 10);
    const month = dateStr.substring(3, 5);
    const day = dateStr.substring(5, 7);
    const year = rocYear + 1911;
    const date = `${year}-${month}-${day}`;

    // 3. Random Code (4 chars, Index 17-21)
    const randomCode = rawString.substring(17, 21);

    // 4. Sales Amount (8 chars, Index 21-29) - Hex encoded
    const salesAmountHex = rawString.substring(21, 29);
    const salesAmount = parseInt(salesAmountHex, 16);

    // 5. Total Amount (8 chars, Index 29-37) - Hex encoded
    const totalAmountHex = rawString.substring(29, 37);
    const totalAmount = parseInt(totalAmountHex, 16);

    // 6. Buyer ID (8 chars, Index 37-45)
    let buyerId = rawString.substring(37, 45);
    if (buyerId === "00000000") {
      buyerId = "";
    }

    // 7. Seller ID (8 chars, Index 45-53)
    const sellerId = rawString.substring(45, 53);

    // 8. Tax Amount Calculation
    const taxAmount = totalAmount - salesAmount;

    return {
      invoiceNumber,
      date,
      description: randomCode,
      amount: salesAmount,
      totalAmount,
      buyerId,
      sellerId,
      taxAmount,
    };
  } catch (error) {
    console.error("Error parsing invoice string:", error);
    return null;
  }
};
