import { describe, it, expect } from 'vitest';
import { parseReceipt, isExcludedLine, extractPrice } from './receiptParser.js';

const LIDL = `LIDL GB
St Georges Retail Park
Leicester LE1 1RE
VAT No 123 4567 89

Bananas Loose            0.79
Whole Milk 2.27L         1.35
Free Range Eggs x6       1.29
Chicken Breast Fillets   3.49
2 x 0.85
Toothpaste               1.10
Dark Chocolate 70%       0.99

SUBTOTAL                 10.00
VAT A 20%                 1.20
TOTAL                    11.20
CONTACTLESS              11.20
VISA DEBIT
CUSTOMER COPY PLEASE RETAIN RECEIPT
Enter survey lidl.co.uk/haveyoursay
`;

describe('extractPrice', () => {
  it('reads a trailing price with or without symbol', () => {
    expect(extractPrice('Bananas Loose 0.79')).toBe(0.79);
    expect(extractPrice('Milk £1.35')).toBe(1.35);
    expect(extractPrice('No price here')).toBeNull();
  });
});

describe('isExcludedLine', () => {
  it('drops payment, survey and legal noise', () => {
    expect(isExcludedLine('TOTAL 11.20')).toBe(true);
    expect(isExcludedLine('CONTACTLESS 11.20')).toBe(true);
    expect(isExcludedLine('CUSTOMER COPY PLEASE RETAIN RECEIPT')).toBe(true);
    expect(isExcludedLine('Enter survey lidl.co.uk/haveyoursay')).toBe(true);
    expect(isExcludedLine('VAT A 20% 1.20')).toBe(true);
  });
  it('keeps a normal product line', () => {
    expect(isExcludedLine('Bananas Loose 0.79')).toBe(false);
  });
});

describe('parseReceipt', () => {
  const result = parseReceipt(LIDL);

  it('extracts the real products and nothing after TOTAL', () => {
    const names = result.items.map((i) => i.name.toLowerCase());
    expect(names.some((n) => n.includes('banana'))).toBe(true);
    expect(names.some((n) => n.includes('milk'))).toBe(true);
    expect(names.some((n) => n.includes('egg'))).toBe(true);
    expect(names.some((n) => n.includes('total'))).toBe(false);
    expect(names.some((n) => n.includes('contactless'))).toBe(false);
  });

  it('reports how many lines it filtered', () => {
    expect(result.stats.linesFiltered).toBeGreaterThan(0);
    expect(result.stats.itemsFound).toBeGreaterThanOrEqual(4);
  });

  it('assigns a confidence to every item', () => {
    for (const item of result.items) {
      expect(['high', 'medium', 'low']).toContain(item.confidence);
    }
  });
});
