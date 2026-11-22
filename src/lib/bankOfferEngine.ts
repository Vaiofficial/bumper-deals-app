import { BankOfferInfo } from '@/types/deal';

/**
 * Parses bank offer texts, cashback tags, and credit card instant discounts from Amazon India.
 * Also models standard Indian e-commerce instant bank card promotions (10% instant discount / 5% cashback).
 */
export function extractBankOffer(cardText: string, currentPrice: number): BankOfferInfo | undefined {
  // 1. Check for explicit text like "Up to 5% back with Amazon Pay ICICI card"
  const iciciMatch = cardText.match(/Up to (\d+)% back with (?:Amazon Pay )?ICICI card/i);
  if (iciciMatch) {
    const percent = parseInt(iciciMatch[1], 10);
    const discount = Math.round((currentPrice * percent) / 100);
    return {
      hasBankOffer: true,
      bankName: 'ICICI Bank',
      offerText: `Up to ${percent}% Cashback with Amazon Pay ICICI Card`,
      instantDiscountAmount: discount,
      effectivePriceWithBank: Math.max(0, currentPrice - discount),
    };
  }

  // 2. Check for explicit instant discount phrases like "Flat ₹1,500 off on HDFC / SBI"
  const flatMatch = cardText.match(/(?:Flat|Save)\s*(?:INR|₹)?\s*(\d[\d,]*)\s*(?:Instant Discount|off)?\s*(?:on|with)?\s*(HDFC|SBI|ICICI|Axis|OneCard|Bank)/i);
  if (flatMatch) {
    const amount = parseInt(flatMatch[1].replace(/,/g, ''), 10);
    const bank = flatMatch[2] || 'Bank';
    return {
      hasBankOffer: true,
      bankName: `${bank} Card`,
      offerText: `Flat ₹${amount.toLocaleString('en-IN')} Instant Discount with ${bank}`,
      instantDiscountAmount: amount,
      effectivePriceWithBank: Math.max(0, currentPrice - amount),
    };
  }

  // 3. High-Value Tech (Laptops & Mobiles >= ₹10,000) have standard 10% instant card discount (capped at ₹1,500 - ₹3,000)
  if (currentPrice >= 12000) {
    // Typical Indian festival / sale bank discount: 10% instant discount capped at ₹1,500 or ₹2,000
    const calculatedDiscount = Math.min(2000, Math.round(currentPrice * 0.10));
    return {
      hasBankOffer: true,
      bankName: 'HDFC / ICICI / SBI',
      offerText: `Up to ₹${calculatedDiscount.toLocaleString('en-IN')} Instant Discount on Credit/Debit Cards`,
      instantDiscountAmount: calculatedDiscount,
      effectivePriceWithBank: currentPrice - calculatedDiscount,
    };
  }

  // 4. Electronics / Wearables >= ₹3,000 have 5% card offer
  if (currentPrice >= 3000) {
    const calculatedDiscount = Math.min(750, Math.round(currentPrice * 0.05));
    return {
      hasBankOffer: true,
      bankName: 'Credit Cards',
      offerText: `Up to ₹${calculatedDiscount.toLocaleString('en-IN')} Instant Bank Offer`,
      instantDiscountAmount: calculatedDiscount,
      effectivePriceWithBank: currentPrice - calculatedDiscount,
    };
  }

  return undefined;
}
