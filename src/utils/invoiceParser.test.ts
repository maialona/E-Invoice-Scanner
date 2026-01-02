import { describe, it, expect } from 'vitest';
import { parseInvoice } from './invoiceParser';

describe('InvoiceParser', () => {
  it('parses a valid invoice string correctly', () => {
    // Example from specs:
    // Invoice Num: AB12345678 (0-10)
    // Date: 1130102 (10-17) -> 2024-01-02
    // Random: 9999 (17-21)
    // Sales Amount: 00000064 (21-29) -> 100 (Hex 64)
    // Total Amount: 00000069 (29-37) -> 105 (Hex 69)
    // Buyer: 00000000 (37-45) -> Empty
    // Seller: 12345678 (45-53)
    // Padding to meet 77 char limit (53 chars data + 24 chars padding)
    const raw = "AB123456781130102999900000064000000690000000012345678" + "0".repeat(30);
    
    const result = parseInvoice(raw);
    
    expect(result).not.toBeNull();
    expect(result?.invoiceNumber).toBe("AB12345678");
    expect(result?.date).toBe("2024-01-02");
    expect(result?.description).toBe("9999");
    expect(result?.amount).toBe(100);
    expect(result?.totalAmount).toBe(105);
    expect(result?.taxAmount).toBe(5);
    expect(result?.buyerId).toBe("");
    expect(result?.sellerId).toBe("12345678");
  });

  it('returns null for short strings', () => {
    const raw = "ShortString";
    expect(parseInvoice(raw)).toBeNull();
  });

  it('handles buyer ID if present', () => {
    // Buyer ID: 87654321
    const raw = "AB123456781130102999900000064000000698765432112345678" + "0".repeat(30);
    const result = parseInvoice(raw);
    expect(result?.buyerId).toBe("87654321");
  });
});
