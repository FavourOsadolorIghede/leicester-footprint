import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ScanBarcode, Search, Plus, Trash2, ShoppingBasket, PackageSearch } from 'lucide-react';
import { PageHeader, EmptyState, Estimate } from '@/components/common.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input, Select, Badge } from '@/components/ui/primitives.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.jsx';
import { useCollection } from '@/lib/hooks.js';
import { products } from '@/lib/db.js';
import { relativeDate, kg } from '@/lib/format.js';
import {
  classifyFood,
  foodCo2e,
  foodOptions,
  ORIGIN_MULTIPLIER,
} from '@/domain/emissionFactors.js';
import { ORIGIN_OPTIONS } from '@/domain/receiptParser.js';

const FOOD_OPTS = foodOptions();
const OFF_URL = (code) => `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(code)}.json`;

function estimate(foodKey, grams, origin) {
  const kgWeight = (Number(grams) || 0) / 1000 || 0.25;
  const base = foodCo2e(foodKey, kgWeight);
  const mult = ORIGIN_MULTIPLIER[origin] ?? 1;
  return Math.round(base * mult * 100) / 100;
}

export default function Products() {
  const { rows } = useCollection(products, 'products');
  const [tab, setTab] = useState('scan');
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(null);
  const [manual, setManual] = useState({ name: '', foodKey: 'unknown', grams: '', origin: 'unknown' });

  const basket = rows.filter((r) => r.inBasket);
  const saved = rows.filter((r) => !r.inBasket);
  const basketTotal = useMemo(() => basket.reduce((a, r) => a + (r.co2eKg || 0), 0), [basket]);

  async function lookup(e) {
    e?.preventDefault();
    const code = barcode.trim();
    if (!code) return;
    setLoading(true);
    setFound(null);
    try {
      const res = await fetch(OFF_URL(code));
      const json = await res.json();
      if (json.status !== 1) {
        toast.error('Product not found — add it manually below');
        setManual((m) => ({ ...m, name: '' }));
        setTab('scan');
      } else {
        const p = json.product;
        const name = p.product_name || p.generic_name || 'Unknown product';
        const foodKey = classifyFood(`${name} ${p.categories || ''}`);
        setFound({
          barcode: code,
          name,
          brand: p.brands || '',
          category: p.categories_tags?.[0]?.replace('en:', '') || '',
          grams: parseFloat(p.product_quantity) || '',
          foodKey,
          origin: 'unknown',
          tags: (p._keywords || []).slice(0, 6),
        });
      }
    } catch {
      toast.error('Open Food Facts is unreachable — add the product manually');
    } finally {
      setLoading(false);
    }
  }

  async function addFound(toBasket) {
    const co2eKg = estimate(found.foodKey, found.grams, found.origin);
    await products.add({ ...found, co2eKg, inBasket: toBasket, source: 'barcode' });
    toast.success(toBasket ? 'Added to basket' : 'Saved to my items');
    setFound(null);
    setBarcode('');
  }

  async function addManual(e) {
    e.preventDefault();
    if (!manual.name.trim()) return toast.error('Give the product a name');
    const co2eKg = estimate(manual.foodKey, manual.grams, manual.origin);
    await products.add({ ...manual, barcode: null, co2eKg, inBasket: true, source: 'manual' });
    toast.success('Added to basket');
    setManual({ name: '', foodKey: 'unknown', grams: '', origin: 'unknown' });
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Products" subtitle="Look up a barcode or add items to estimate their footprint" />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="scan"><ScanBarcode className="size-4" /> Scan</TabsTrigger>
          <TabsTrigger value="basket"><ShoppingBasket className="size-4" /> Basket ({basket.length})</TabsTrigger>
          <TabsTrigger value="saved"><PackageSearch className="size-4" /> My items ({saved.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Barcode lookup</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={lookup} className="flex gap-2">
                <Input
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Type or paste a barcode number"
                  inputMode="numeric"
                />
                <Button type="submit" disabled={loading}>
                  <Search className="size-4" /> {loading ? 'Looking…' : 'Look up'}
                </Button>
              </form>
              <p className="mt-2 text-xs text-muted-foreground">
                Data from Open Food Facts (openfoodfacts.org). No barcode is stored unless you save the item.
              </p>

              {found && (
                <div className="mt-4 rounded-xl border p-4">
                  <p className="font-semibold">{found.name}</p>
                  {found.brand && <p className="text-sm text-muted-foreground">{found.brand}</p>}
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <label className="text-xs">
                      Type
                      <Select value={found.foodKey} onChange={(e) => setFound({ ...found, foodKey: e.target.value })} className="mt-1 h-9">
                        {FOOD_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </Select>
                    </label>
                    <label className="text-xs">
                      Weight (g)
                      <Input type="number" value={found.grams} onChange={(e) => setFound({ ...found, grams: e.target.value })} className="mt-1 h-9" placeholder="250" />
                    </label>
                    <label className="text-xs">
                      Origin
                      <Select value={found.origin} onChange={(e) => setFound({ ...found, origin: e.target.value })} className="mt-1 h-9">
                        {ORIGIN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </Select>
                    </label>
                  </div>
                  <p className="mt-3 text-sm">
                    Estimated: <strong>{kg(estimate(found.foodKey, found.grams, found.origin))} CO₂e</strong>
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" onClick={() => addFound(true)}>Add to basket</Button>
                    <Button size="sm" variant="outline" onClick={() => addFound(false)}>Save to my items</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Add manually</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={addManual} className="grid gap-3 sm:grid-cols-2">
                <Input value={manual.name} onChange={(e) => setManual({ ...manual, name: e.target.value, foodKey: classifyFood(e.target.value) })} placeholder="Product name" className="sm:col-span-2" />
                <Select value={manual.foodKey} onChange={(e) => setManual({ ...manual, foodKey: e.target.value })}>
                  {FOOD_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
                <Input type="number" value={manual.grams} onChange={(e) => setManual({ ...manual, grams: e.target.value })} placeholder="Weight (g)" />
                <Select value={manual.origin} onChange={(e) => setManual({ ...manual, origin: e.target.value })}>
                  {ORIGIN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
                <Button type="submit"><Plus className="size-4" /> Add to basket</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="basket">
          {basket.length === 0 ? (
            <EmptyState icon={ShoppingBasket} title="Your basket is empty" description="Scan or add products to see the combined footprint of a shop." />
          ) : (
            <Card>
              <CardContent className="space-y-2 p-4">
                {basket.map((p) => (
                  <ProductRow key={p.id} p={p} />
                ))}
                <p className="pt-2 text-sm font-semibold">Basket total: {kg(basketTotal)} CO₂e</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="saved">
          {saved.length === 0 ? (
            <EmptyState icon={PackageSearch} title="No saved items" description="Save products you buy often for quick re-adding." />
          ) : (
            <Card>
              <CardContent className="space-y-2 p-4">
                {saved.map((p) => <ProductRow key={p.id} p={p} />)}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Estimate />
    </div>
  );
}

function ProductRow({ p }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border p-2.5 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium">{p.name}</p>
        <p className="text-xs text-muted-foreground">
          {p.brand ? `${p.brand} · ` : ''}{relativeDate(p.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{p.source}</Badge>
        <span className="tabular-nums">{kg(p.co2eKg)}</span>
        <Button variant="ghost" size="icon" className="size-8" onClick={() => products.remove(p.id).then(() => toast('Removed'))} aria-label="Remove">
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}
