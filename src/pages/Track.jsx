import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Route, Zap, Trash2, Lightbulb, MapPinned, Info } from 'lucide-react';
import { PageHeader, Estimate } from '@/components/common.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input, Label, Select } from '@/components/ui/primitives.jsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs.jsx';
import { useCollection } from '@/lib/hooks.js';
import { journeys, energyReadings } from '@/lib/db.js';
import { relativeDate, kg } from '@/lib/format.js';
import {
  TRAVEL_MODES,
  travelCo2e,
  energyCo2e,
  spendToKwh,
} from '@/domain/emissionFactors.js';
import { isMobileApp } from '@/lib/environment.js';
import { AutoDetectTrip } from '@/components/AutoDetectTrip.jsx';

const DISTANCE_PRESETS = [1, 2, 5, 10];

const MODE_TIPS = {
  walk: 'Walking is zero direct emissions and the cheapest way to travel.',
  bike: 'Cycling replaces the trips cars are worst at — short, stop-start journeys.',
  bus: 'A reasonably full bus emits roughly half the CO₂e per passenger of an average car.',
  rail: 'Rail is about 4–5× lower carbon than the equivalent solo car journey.',
  car_petrol: 'Car-sharing halves the per-person footprint of this trip.',
  car_diesel: 'Combining errands into one trip avoids repeated cold-engine emissions.',
  car_electric: 'An EV on the UK grid is roughly a third of a petrol car’s footprint.',
};

function TravelTab() {
  const { rows } = useCollection(journeys, 'journeys');
  const [mode, setMode] = useState('bike');
  const [distance, setDistance] = useState('');

  const factor = TRAVEL_MODES.find((m) => m.value === mode)?.factor ?? 0.149;
  const preview = travelCo2e(mode, distance || 0);

  const total = useMemo(() => rows.reduce((a, r) => a + (r.co2eKg || 0), 0), [rows]);

  async function save(e) {
    e.preventDefault();
    const km = parseFloat(distance);
    if (!km || km <= 0) return toast.error('Enter a distance greater than 0');
    const co2eKg = travelCo2e(mode, km);
    await journeys.add({
      mode,
      modeLabel: TRAVEL_MODES.find((m) => m.value === mode)?.label,
      distanceKm: km,
      co2eKg,
      source: 'manual',
    });
    setDistance('');
    toast.success(`Journey logged · ${kg(co2eKg)} CO₂e`);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">Log a journey</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Mode</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {TRAVEL_MODES.slice(0, 8).map((m) => (
                  <button
                    type="button"
                    key={m.value}
                    onClick={() => setMode(m.value)}
                    className={`rounded-lg border p-2 text-xs font-medium transition-colors ${
                      mode === m.value ? 'border-primary bg-primary/10 text-primary' : 'hover:bg-accent'
                    }`}
                  >
                    {m.label}
                    <span className="block text-[10px] font-normal text-muted-foreground">
                      {m.factor === 0 ? '0' : m.factor} kg/km
                    </span>
                  </button>
                ))}
              </div>
              <Select value={mode} onChange={(e) => setMode(e.target.value)} className="mt-1">
                {TRAVEL_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label} — {m.factor} kg/km
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dist">Distance (km)</Label>
              <Input
                id="dist"
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="e.g. 3.2"
              />
              <div className="flex flex-wrap gap-2">
                {DISTANCE_PRESETS.map((d) => (
                  <Button key={d} type="button" variant="outline" size="sm" onClick={() => setDistance(String(d))}>
                    {d} km
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm">
              Estimated impact:{' '}
              <strong>{kg(preview)} CO₂e</strong>{' '}
              <span className="text-muted-foreground">({factor} kg/km)</span>
            </div>

            <Button type="submit" className="w-full">Add journey</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardContent className="flex items-start gap-3 p-4">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-cat-energy" />
            <p className="text-sm text-muted-foreground">
              {MODE_TIPS[mode] || 'Choosing a lower-carbon mode for regular trips adds up fast over a year.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent journeys</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rows.length === 0 && <p className="text-sm text-muted-foreground">No journeys logged yet.</p>}
            {rows.slice(0, 8).map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg border p-2.5 text-sm">
                <div>
                  <p className="font-medium">{r.modeLabel || r.mode} · {r.distanceKm} km</p>
                  <p className="text-xs text-muted-foreground">{relativeDate(r.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums">{kg(r.co2eKg)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => journeys.remove(r.id).then(() => toast('Journey removed'))}
                    aria-label="Delete journey"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
            {rows.length > 0 && (
              <p className="pt-1 text-sm font-medium">Total logged: {kg(total)} CO₂e</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EnergyTab() {
  const { rows } = useCollection(energyReadings, 'energyReadings');
  const [elec, setElec] = useState('');
  const [gas, setGas] = useState('');
  const [spend, setSpend] = useState('');
  const [showSpend, setShowSpend] = useState(false);

  const elecKwh = showSpend && spend ? spendToKwh(spend) : parseFloat(elec) || 0;
  const gasKwh = parseFloat(gas) || 0;
  const preview = energyCo2e(elecKwh, gasKwh);
  const total = useMemo(() => rows.reduce((a, r) => a + (r.co2eKg || 0), 0), [rows]);

  async function save(e) {
    e.preventDefault();
    if (elecKwh <= 0 && gasKwh <= 0) return toast.error('Enter an electricity or gas amount');
    const co2eKg = energyCo2e(elecKwh, gasKwh);
    await energyReadings.add({
      electricityKwh: Math.round(elecKwh * 10) / 10,
      gasKwh: Math.round(gasKwh * 10) / 10,
      estimatedFromSpend: showSpend,
      co2eKg,
    });
    setElec('');
    setGas('');
    setSpend('');
    toast.success(`Energy reading saved · ${kg(co2eKg)} CO₂e`);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">Add an energy reading</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={save} className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Electricity</Label>
              <button
                type="button"
                onClick={() => setShowSpend((s) => !s)}
                className="text-xs font-medium text-primary hover:underline"
              >
                {showSpend ? 'Enter kWh instead' : "Don't know kWh?"}
              </button>
            </div>
            {showSpend ? (
              <div className="space-y-1.5">
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={spend}
                  onChange={(e) => setSpend(e.target.value)}
                  placeholder="£ spent on electricity"
                />
                <p className="text-xs text-muted-foreground">
                  Rough estimate at ~£0.28/kWh → {elecKwh ? `${elecKwh} kWh` : '—'}
                </p>
              </div>
            ) : (
              <Input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={elec}
                onChange={(e) => setElec(e.target.value)}
                placeholder="kWh used"
              />
            )}

            <div className="space-y-1.5">
              <Label htmlFor="gas">Gas (kWh)</Label>
              <Input
                id="gas"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.1"
                value={gas}
                onChange={(e) => setGas(e.target.value)}
                placeholder="kWh used (optional)"
              />
            </div>

            <div className="rounded-lg bg-muted p-3 text-sm">
              Estimated impact: <strong>{kg(preview)} CO₂e</strong>{' '}
              <span className="text-muted-foreground">(0.207 electricity, 0.182 gas kg/kWh)</span>
            </div>

            <Button type="submit" className="w-full">Save reading</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardContent className="flex items-start gap-3 p-4">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-cat-energy" />
            <p className="text-sm text-muted-foreground">
              A smart meter reading each week gives the most accurate trend. Lowering your thermostat by
              1°C cuts heating energy by around 8%.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent readings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {rows.length === 0 && <p className="text-sm text-muted-foreground">No readings yet.</p>}
            {rows.slice(0, 8).map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg border p-2.5 text-sm">
                <div>
                  <p className="font-medium">
                    {r.electricityKwh} kWh elec{r.gasKwh ? ` · ${r.gasKwh} kWh gas` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {relativeDate(r.createdAt)}
                    {r.estimatedFromSpend ? ' · estimated' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums">{kg(r.co2eKg)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => energyReadings.remove(r.id).then(() => toast('Reading removed'))}
                    aria-label="Delete reading"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
            {rows.length > 0 && <p className="pt-1 text-sm font-medium">Total logged: {kg(total)} CO₂e</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Track() {
  const [tab, setTab] = useState('travel');
  const appMode = isMobileApp();

  return (
    <div className="space-y-6">
      <PageHeader title="Track" subtitle="Log travel and energy use to build your footprint" />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="travel">
            <Route className="size-4" /> Travel
          </TabsTrigger>
          <TabsTrigger value="energy">
            <Zap className="size-4" /> Energy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="travel">
          {appMode ? (
            <div className="mb-4">
              <AutoDetectTrip />
            </div>
          ) : (
            <Card className="mb-4 border-primary/30 bg-primary/5">
              <CardContent className="flex items-start gap-3 p-4 text-sm">
                <MapPinned className="mt-0.5 size-5 shrink-0 text-primary" />
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Auto-detect trips</strong> is available when you
                  install this app to your home screen. In a browser tab, log journeys manually below.
                </p>
              </CardContent>
            </Card>
          )}
          <TravelTab />
        </TabsContent>

        <TabsContent value="energy">
          <EnergyTab />
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="size-3.5" />
        <Estimate className="text-xs" />
      </div>
    </div>
  );
}
