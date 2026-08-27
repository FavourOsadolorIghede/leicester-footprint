/**
 * Receipt line-item parser.
 *
 * Runs entirely in the browser on OCR text. The job: keep only lines that look
 * like real purchased products (name + price) and drop receipt noise — totals,
 * VAT, card/payment lines, survey URLs, transaction IDs, store address, etc.
 *
 * `parseReceipt(text)` → { items, filteredLines, stats }
 */

/** Lines containing any of these (case-insensitive) are never items. */
export const EXCLUDE_KEYWORDS = [
  'total', 'subtotal', 'sub-total', 'balance', 'change', 'amount due', 'tender',
  'card', 'contactless', 'visa', 'mastercard', 'debit', 'credit', 'chip and pin',
  'auth', 'approved', 'verification', 'aid:', 'mid:', 'tid:',
  'customer copy', 'please retain', 'receipt', 'merchant copy', 'cardholder copy',
  'thank you', 'thanks for shopping', 'welcome', 'served by',
  'a000', 'trns', 'seq no', 'terminal id', 'merchant id', 'transaction',
  'enter survey', 'have your say', 'voucher', 'coupon', 'prize draw',
  'www.', 'http', '.co.uk', '.com', 'tel:', 'phone:',
  'vat', 'tax', 'rate', 'vat no', 'vat reg',
  'address', 'store', 'branch', 'opening hours', 'open', 'closed',
  'please note', 'important', 'notice',
];

/** Section boundaries. */
export const SECTION_PATTERNS = {
  // Once a line matches one of these, we're past the items — stop.
  end: [
    /^(sub[\s-]?total|total|balance|card|cash|change|tender)/i,
    /^\*+\s*(total|vat|payment)/i,
  ],
  // Header lines to skip before the items section starts.
  skipUntilItems: [/^(lidl|tesco|sainsbury|asda|morrisons|aldi|waitrose|co-?op)/i],
};

const PRICE_RE = /[£$]?\s*(\d+[.,]\d{2})\s*$/;
const QTY_RE = /(\d+)\s*[xX×]\s*[£$]?\s*(\d+[.,]\d{2})/;

/** Trailing price on a line, or null. */
export function extractPrice(line) {
  const m = line.match(PRICE_RE);
  return m ? parseFloat(m[1].replace(',', '.')) : null;
}

/** "2 x 0.85" style quantity multiplier, or null. */
export function extractQuantity(line) {
  const m = line.match(QTY_RE);
  return m
    ? { quantity: parseInt(m[1], 10), unitPrice: parseFloat(m[2].replace(',', '.')) }
    : null;
}

/** True if a line is receipt noise rather than a product. */
export function isExcludedLine(line) {
  const t = line.toLowerCase();
  if (EXCLUDE_KEYWORDS.some((k) => t.includes(k))) return true;

  const letters = (line.match(/[a-z]/gi) || []).length;
  const nonSpace = line.replace(/\s/g, '').length;
  if (nonSpace > 0 && letters / nonSpace < 0.4) return true; // mostly digits/symbols

  const nameOnly = line
    .replace(/[£$]?\s*\d+[.,]\d{2}\s*$/, '')
    .trim()
    .replace(/[^\w\s]/g, ' ')
    .trim();
  if (nameOnly.length < 3) return true;

  if (/^\d{2}[/-]\d{2}[/-]\d{2,4}/.test(line)) return true; // date
  if (/^\d{2}:\d{2}/.test(line)) return true; // time
  if (/^[#*\-=_]{3,}$/.test(line.trim())) return true; // separator
  if (/^[A-Z]$/.test(line.trim())) return true; // stray VAT marker

  return false;
}

/** high | medium | low confidence that an extracted line is a genuine item. */
export function scoreConfidence(raw, name, price) {
  let score = 0;
  if (price !== null && price > 0) score += 2;
  if (name.length >= 5 && name.length <= 40) score += 1;
  if (['fresh', 'organic', 'free', 'range', 'pack', 'kg', 'g', 'ml', 'litre', 'bottle'].some((w) => name.toLowerCase().includes(w))) {
    score += 1;
  }
  if (!/[^\w\s£$.,()-]/g.test(raw)) score += 1;
  return score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low';
}

/**
 * @param {string} text raw OCR output
 * @returns {{items: Array, filteredLines: Array<{line:string, reason:string}>, stats: object}}
 */
export function parseReceipt(text) {
  const lines = String(text || '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const items = [];
  const filteredLines = [];
  let inItems = false;
  let pastItems = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (SECTION_PATTERNS.end.some((re) => re.test(line))) {
      pastItems = true;
      filteredLines.push({ line, reason: 'After totals section' });
      continue;
    }
    if (pastItems) {
      filteredLines.push({ line, reason: 'After totals section' });
      continue;
    }
    if (!inItems && SECTION_PATTERNS.skipUntilItems.some((re) => re.test(line))) {
      filteredLines.push({ line, reason: 'Store header' });
      continue;
    }
    if (!inItems && i > 0) inItems = true;

    if (isExcludedLine(line)) {
      filteredLines.push({ line, reason: 'Excluded keyword or pattern' });
      continue;
    }

    const price = extractPrice(line);
    const qty = extractQuantity(line);
    if (price === null && qty === null) {
      filteredLines.push({ line, reason: 'No price detected' });
      continue;
    }

    let name = line
      .replace(/[£$]?\s*\d+[.,]\d{2}\s*$/, '')
      .trim()
      .replace(/^\d+\s*[xX×]\s*[£$]?\s*\d+[.,]\d{2}\s*/, '')
      .trim()
      .replace(/[^\w\s()&-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (name.length < 3 || name.length > 60) {
      filteredLines.push({ line, reason: 'Item name too short or too long' });
      continue;
    }

    const confidence = scoreConfidence(line, name, price);
    let finalPrice = price;
    if (qty && price === null) finalPrice = Math.round(qty.quantity * qty.unitPrice * 100) / 100;

    items.push({
      rawText: line,
      name,
      price: finalPrice,
      confidence,
      quantity: qty?.quantity || 1,
    });
  }

  return {
    items,
    filteredLines,
    stats: {
      totalLines: lines.length,
      itemsFound: items.length,
      linesFiltered: filteredLines.length,
    },
  };
}

export const RECEIPT_ITEM_CATEGORIES = [
  { value: 'food', label: 'Food' },
  { value: 'household', label: 'Household' },
  { value: 'other', label: 'Other' },
];

export const ORIGIN_OPTIONS = [
  { value: 'uk', label: 'UK' },
  { value: 'imported', label: 'Imported' },
  { value: 'unknown', label: 'Unknown' },
];
