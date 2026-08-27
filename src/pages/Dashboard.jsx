import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Route,
  Zap,
  ReceiptText,
  Info,
  PiggyBank,
  Leaf,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { PageHeader, StatCard, EmptyState, ActionCard, Estimate, FadeIn } from '@/components/common.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge, Progress } from '@/components/ui/primitives.jsx';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx';
import { Dialog } from '@/components/ui/dialog.jsx';
import { useDashboardData, useSettings, usePullToRefresh } from '@/lib/hooks.js';
import { kg, gbp } from '@/lib/format.js';
import { UK_WEEKLY_REFERENCE_KG } from '@/domain/emissionFactors.js';

const CATS = [
  { key: 'travel', label: 'Travel', icon: Route, color: 'hsl(var(--cat-travel))' },
  { key: 'energy', label: 'Energy', icon: Zap, color: 'hsl(var(--cat-energy))' },
  { key: 'food', label: 'Food & Shopping', icon: ReceiptText, color: 'hsl(var(--cat-food))' },
];

function recommendationsFor(data) {
  const ranked = [...CATS].sort((a, b) => data[b.key] - data[a.key]);
  const top = ranked[0];
  const tips = [];
  if (top.key === 'travel') {
    tips.push(
      { text: 'Try cycling or walking for short trips under 2 km', impact: 'High', reason: `Travel is your biggest category (${kg(data.travel)} CO₂e)`, to: '/app/track' },
      { text: 'Use Leicester buses for commuting — often cheaper than driving', impact: 'Medium', reason: 'Based on your travel patterns', to: '/app/leicester' }
    );
  } else if (top.key === 'food') {
    tips.push(
      { text: 'Shop at Leicester Market for local, low-packaging produce', impact: 'High', reason: `Food is your biggest category (${kg(data.food)} CO₂e)`, to: '/app/leicester' },
      { text: 'Try plant-based meals 2–3 times a week', impact: 'High', reason: 'Based on your shopping data', to: '/app/products' }
    );
  } else {
    tips.push(
      { text: 'Switch to LED bulbs — payback in under a year', impact: 'Medium', reason: `Energy is your biggest category (${kg(data.energy)} CO₂e)`, to: '/app/track' },
      { text: 'Check Council energy grants for Leicester residents', impact: 'High', reason: 'Based on your energy usage', to: '/app/leicester' }
    );
  }
  tips.push({ text: 'Visit a refill shop to cut packaging waste', impact: 'Medium', reason: 'Helps reduce your overall footprint', to: '/app/leicester' });
  return tips.slice(0, 3);
}

export default function Dashboard() {
  const [period, setPeriod] = useState('week');
  const [showSavings, setShowSavings] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const [settings] = useSettings();
  const data = useDashboardData(period);
  const { pull, isPulling } = usePullToRefresh(async () => {});

  const savings = useMemo(
    () => ({ money: data.total * 0.15, co2: data.total * 0.2 }),
    [data.total]
  );

  const periodLabel = { week: 'this week', month: 'this month', year: 'this year' }[period];
  const target = period === 'week' ? settings.weeklyTargetKg : null;

  if (!data.loading && data.total === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" subtitle="Your estimated carbon footprint overview" />
        <EmptyState
          icon={Leaf}
          title="Start tracking your footprint"
          description="Log an activity to see estimates by category and discover greener local options."
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <ActionCard to="/app/track" icon={Route} title="Log a journey" />
            <ActionCard to="/app/track" icon={Zap} title="Add an energy reading" />
            <ActionCard to="/app/receipts" icon={ReceiptText} title="Scan a receipt" />
          </div>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isPulling && (
        <div className="fixed left-1/2 top-16 z-40 -translate-x-1/2 lg:hidden" style={{ opacity: pull / 90 }}>
          <RefreshCw className="size-5 animate-spin text-primary" />
        </div>
      )}

      <PageHeader
        title="Dashboard"
        subtitle={`Your estimated carbon footprint · ${periodLabel}`}
        action={
          <div className="flex items-center gap-2">
            <Button variant={showSavings ? 'default' : 'outline'} size="sm" onClick={() => setShowSavings((s) => !s)}>
              <PiggyBank className="size-4" /> {showSavings ? 'Show CO₂' : 'Show savings'}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setHowOpen(true)} aria-label="How we estimate">
              <Info className="size-5" />
            </Button>
          </div>
        }
      />

      <Tabs value={period} onValueChange={setPeriod}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="week">This week</TabsTrigger>
          <TabsTrigger value="month">This month</TabsTrigger>
          <TabsTrigger value="year">This year</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={showSavings ? 'Potential saving' : 'Total estimate'}
          value={showSavings ? gbp(savings.money) : data.total.toFixed(1)}
          unit={showSavings ? undefined : 'kg CO₂e'}
          icon={showSavings ? PiggyBank : Leaf}
          hint={showSavings ? `≈ ${kg(savings.co2)} CO₂e avoidable` : target ? `Weekly target ${kg(target, 0)}` : undefined}
        />
        {CATS.map((c) => (
          <StatCard key={c.key} title={c.label} value={data[c.key].toFixed(1)} unit="kg" icon={c.icon} tone={c.key} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Last 8 weeks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend} margin={{ left: -20, right: 8, top: 4 }}>
                  <defs>
                    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(v) => [`${v} kg CO₂e`, 'Total']}
                  />
                  <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#g)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Breakdown · {periodLabel}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {CATS.map((c) => {
              const pct = data.total > 0 ? (data[c.key] / data.total) * 100 : 0;
              return (
                <div key={c.key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <c.icon className="size-4" style={{ color: c.color }} />
                      {c.label}
                    </span>
                    <span className="text-muted-foreground">{kg(data[c.key])} · {pct.toFixed(0)}%</span>
                  </div>
                  <Progress value={pct} color={c.color} />
                </div>
              );
            })}
            {period === 'week' && (
              <p className="pt-1 text-xs text-muted-foreground">
                UK reference ≈ {kg(UK_WEEKLY_REFERENCE_KG, 0)}/week across trackable categories.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 3 ways to cut your footprint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendationsFor(data).map((tip, i) => (
            <FadeIn key={tip.text} delay={i * 0.05}>
              <div className="flex items-start justify-between gap-4 rounded-xl border p-3">
                <div>
                  <p className="font-medium">{tip.text}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{tip.reason}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge variant={tip.impact === 'High' ? 'success' : 'warning'}>{tip.impact}</Badge>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={tip.to}>
                      Do it <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </FadeIn>
          ))}
        </CardContent>
      </Card>

      <Estimate />

      <Dialog open={howOpen} onClose={() => setHowOpen(false)} title="How we estimate your footprint">
        <div className="space-y-4 text-sm">
          <p>
            All numbers are <strong>estimates</strong> based on UK average emission factors. They help
            guide greener choices but are not exact measurements.
          </p>
          <div>
            <h4 className="font-medium">Our data sources</h4>
            <ul className="mt-1 list-inside list-disc space-y-1 text-muted-foreground">
              <li>Travel: UK Government (DESNZ/DEFRA) conversion factors</li>
              <li>Energy: UK grid average electricity + gas combustion</li>
              <li>Food: peer-reviewed lifecycle assessments (cradle-to-retail)</li>
            </ul>
          </div>
          <div className="rounded-lg border border-cat-energy/30 bg-cat-energy/10 p-3 text-cat-energy">
            <strong>Note:</strong> individual product origins and exact supply chains can't be
            determined from receipts or barcodes. Use these estimates as guidance, not accounting.
          </div>
        </div>
      </Dialog>
    </div>
  );
}
