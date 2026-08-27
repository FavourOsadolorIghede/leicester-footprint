import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import Tesseract from 'tesseract.js';
import {
  Upload,
  ReceiptText,
  Loader2,
  ChevronRight,
  Trash2,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { PageHeader, EmptyState, ConfidenceBadge, Estimate } from '@/components/common.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input, Select } from '@/components/ui/primitives.jsx';
import { useCollection } from '@/lib/hooks.js';
import { receipts, receiptItems } from '@/lib/db.js';
import { relativeDate, kg } from '@/lib/format.js';
import { parseReceipt, RECEIPT_ITEM_CATEGORIES } from '@/domain/receiptParser.js';
import { classifyFood, foodCo2eFromSpend, foodOptions } from '@/domain/emissionFactors.js';

const FOOD_OPTS = foodOptions();
const STEPS = ['Upload', 'Review', 'Categorise', 'Done'];

function itemCo2e(item) {
  if (item.category !== 'food') return 0;
  return foodCo2eFromSpend(item.foodKey, item.price || 0);
}

export default function Receipts() {
  const { rows: history } = useCollection(receipts, 'receipts');
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [merchant, setMerchant] = useState('');
  const [parsed, setParsed] = useState(null);
  const [items, setItems] = useState([]);
  const [showFiltered, setShowFiltered] = useState(false);
  const fileRef = useRef(null);

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please upload an image');
    setBusy(true);
    setProgress(0);
    try {
      const { data } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => m.status === 'recognizing text' && setProgress(Math.round(m.progress * 100)),
      });
      const result = parseReceipt(data.text);
      setParsed(result);
      setItems(
        result.items.map((it) => ({
          ...it,
          include: it.confidence !== 'low',
          category: 'food',
          foodKey: classifyFood(it.name),
        }))
      );
      setStep(1);
      toast.success(`Found ${result.stats.itemsFound} items · filtered ${result.stats.linesFiltered} lines`);
    } catch {
      toast.error('Could not read that image. Try a clearer photo.');
    } finally {
      setBusy(false);
    }
  }

  function loadSample() {
    const sample = `LIDL GB
Leicester LE1 1RE
Bananas Loose 0.79
Whole Milk 2.27L 1.35
Free Range Eggs x6 1.29
Chicken Breast Fillets 3.49
Cheddar Cheese Block 2.19
Wholemeal Bread 0.85
Dark Chocolate 70% 0.99
SUBTOTAL 10.95
TOTAL 10.95
CONTACTLESS 10.95
CUSTOMER COPY PLEASE RETAIN RECEIPT`;
    const result = parseReceipt(sample);
    setParsed(result);
    setMerchant('Lidl');
    setItems(
      result.items.map((it) => ({
        ...it,
        include: it.confidence !== 'low',
        category: 'food',
        foodKey: classifyFood(it.name),
      }))
    );
    setStep(1);
  }

  function patch(idx, p) {
    setItems((list) => list.map((it, i) => (i === idx ? { ...it, ...p } : it)));
  }

  const totals = useMemo(() => {
    const kept = items.filter((i) => i.include);
    const co2 = kept.reduce((a, i) => a + itemCo2e(i), 0);
    const spend = kept.reduce((a, i) => a + (i.price || 0), 0);
    return { count: kept.length, co2: Math.round(co2 * 100) / 100, spend };
  }, [items]);

  async function saveReceipt() {
    const kept = items.filter((i) => i.include);
    if (kept.length === 0) return toast.error('Select at least one item');
    const receipt = await receipts.add({
      merchant: merchant || 'Receipt',
      itemCount: kept.length,
      totalSpend: Math.round(totals.spend * 100) / 100,
      totalCo2eKg: totals.co2,
    });
    for (const it of kept) {
      await receiptItems.add({
        receiptId: receipt.id,
        name: it.name,
        category: it.category,
        foodKey: it.category === 'food' ? it.foodKey : null,
        price: it.price || 0,
        co2eKg: itemCo2e(it),
      });
    }
    toast.success(`Receipt saved · ${kg(totals.co2)} CO₂e added to your dashboard`);
    reset();
  }

  function reset() {
    setStep(0);
    setParsed(null);
    setItems([]);
    setMerchant('');
    setShowFiltered(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receipts"
        subtitle="Scan a shopping receipt — OCR runs entirely in your browser"
        action={step > 0 ? <Button variant="outline" size="sm" onClick={reset}>Start over</Button> : null}
      />

      <ol className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-1">
            <span className={`rounded-full px-2 py-0.5 ${i === step ? 'bg-primary text-primary-foreground' : i < step ? 'bg-primary/15 text-primary' : 'bg-muted'}`}>
              {i + 1}. {s}
            </span>
            {i < STEPS.length - 1 && <ChevronRight className="size-3" />}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <>
          <Card>
            <CardContent className="p-6">
              <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed p-10 text-center hover:bg-accent/50">
                <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onFile} disabled={busy} />
                {busy ? (
                  <>
                    <Loader2 className="size-8 animate-spin text-primary" />
                    <p className="mt-3 font-medium">Reading receipt… {progress}%</p>
                  </>
                ) : (
                  <>
                    <Upload className="size-8 text-muted-foreground" />
                    <p className="mt-3 font-medium">Upload or photograph a receipt</p>
                    <p className="text-sm text-muted-foreground">JPG or PNG · processed locally, never uploaded</p>
                  </>
                )}
              </label>
              <div className="mt-3 text-center">
                <Button variant="link" size="sm" onClick={loadSample} disabled={busy}>
                  Try it with a sample receipt
                </Button>
              </div>
            </CardContent>
          </Card>

          {history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Saved receipts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {history.slice(0, 10).map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border p-2.5 text-sm">
                    <div>
                      <p className="font-medium">{r.merchant} · {r.itemCount} items</p>
                      <p className="text-xs text-muted-foreground">{relativeDate(r.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums">{kg(r.totalCo2eKg)}</span>
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => receipts.remove(r.id).then(() => toast('Receipt removed'))} aria-label="Delete">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {step >= 1 && parsed && (
        <>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">
                {items.filter((i) => i.include).length} of {items.length} lines selected
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowFiltered((s) => !s)}>
                {showFiltered ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                {parsed.stats.linesFiltered} filtered
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="mb-3">
                <Input value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="Shop name (optional)" />
              </div>

              {items.map((it, idx) => (
                <div key={idx} className="rounded-lg border p-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={it.include}
                      onChange={(e) => patch(idx, { include: e.target.checked })}
                      className="mt-1 size-4 accent-primary"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Input
                          value={it.name}
                          onChange={(e) => patch(idx, { name: e.target.value })}
                          className="h-8 flex-1"
                        />
                        <ConfidenceBadge level={it.confidence} />
                      </div>
                      {it.include && (
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Select
                            value={it.category}
                            onChange={(e) => patch(idx, { category: e.target.value })}
                            className="h-8 w-auto"
                          >
                            {RECEIPT_ITEM_CATEGORIES.map((c) => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </Select>
                          {it.category === 'food' && (
                            <Select
                              value={it.foodKey}
                              onChange={(e) => patch(idx, { foodKey: e.target.value })}
                              className="h-8 w-auto"
                            >
                              {FOOD_OPTS.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                              ))}
                            </Select>
                          )}
                          <span className="text-xs text-muted-foreground">
                            £{(it.price || 0).toFixed(2)} · {kg(itemCo2e(it))} CO₂e
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {showFiltered && (
                <div className="mt-3 rounded-lg bg-muted/50 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Filtered out ({parsed.filteredLines.length})</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {parsed.filteredLines.map((f, i) => (
                      <li key={i} className="flex justify-between gap-2">
                        <span className="truncate">{f.line}</span>
                        <span className="shrink-0 opacity-70">{f.reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="text-sm">
                <p className="font-semibold">{totals.count} items · {kg(totals.co2)} CO₂e</p>
                <p className="text-xs text-muted-foreground">Spend recorded: £{totals.spend.toFixed(2)}</p>
              </div>
              <Button onClick={saveReceipt}>
                <Check className="size-4" /> Save to dashboard
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {step === 0 && history.length === 0 && !busy && (
        <EmptyState icon={ReceiptText} title="No receipts yet" description="Scan your weekly shop to estimate the footprint of what you buy." />
      )}

      <Estimate />
    </div>
  );
}
