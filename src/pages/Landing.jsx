import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Leaf,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Zap,
  Route,
  ReceiptText,
  Recycle,
  Users,
  Github,
} from 'lucide-react';
import { AnimatedWaves } from '@/components/AnimatedWaves.jsx';
import { ThemeToggle } from '@/components/ThemeToggle.jsx';
import { Button } from '@/components/ui/button.jsx';

const PILLS = [
  { label: 'Energy', icon: Zap, cls: 'text-cat-energy bg-cat-energy/10' },
  { label: 'Travel', icon: Route, cls: 'text-cat-travel bg-cat-travel/10' },
  { label: 'Food', icon: ReceiptText, cls: 'text-cat-food bg-cat-food/10' },
  { label: 'Waste & Stuff', icon: Recycle, cls: 'text-cat-waste bg-cat-waste/10' },
  { label: 'Community', icon: Users, cls: 'text-cat-community bg-cat-community/10' },
];

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'No account, ever',
    body: 'Everything you log stays in your browser on this device. No sign-up, no cloud, no tracking.',
  },
  {
    icon: MapPin,
    title: 'Built for Leicester',
    body: 'A directory of 20+ local markets, repair cafés, refill shops and advice services baked in.',
  },
  {
    icon: Leaf,
    title: 'Honest estimates',
    body: 'Transparent UK Government and lifecycle factors. We show our working and never overclaim.',
  },
];

const STEPS = [
  { n: 1, title: 'Log an activity', body: 'Add a journey, an energy reading, or scan a receipt or barcode.' },
  { n: 2, title: 'See your estimate', body: 'Your footprint is broken down by travel, energy and food — weekly, monthly, yearly.' },
  { n: 3, title: 'Find a greener option', body: 'Get personalised tips and local Leicester alternatives that also save money.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="size-[18px]" />
            </span>
            Leicester Footprint
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm">
              <Link to="/app">
                Open the app <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:pt-40">
        <AnimatedWaves />
        <div className="relative mx-auto max-w-3xl text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
          >
            <MapPin className="size-3.5" /> Made for Leicester
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-6 text-balance text-4xl font-extrabold tracking-tight sm:text-6xl"
          >
            Carbon footprint tracker for Leicester
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-5 max-w-xl text-pretty text-lg text-muted-foreground"
          >
            Track your estimated impact across travel, energy and shopping, discover cheaper local
            alternatives, and join your community in making Leicester greener — one choice at a time.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex items-center justify-center"
          >
            <Button asChild size="lg">
              <Link to="/app">
                Start tracking <ArrowRight className="size-4" />
              </Link>
            </Button>
          </motion.div>

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {PILLS.map((p) => (
              <span
                key={p.label}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${p.cls}`}
              >
                <p.icon className="size-3.5" />
                {p.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {BENEFITS.map((b) => (
            <div key={b.title} className="card-surface p-6">
              <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <b.icon className="size-5" />
              </div>
              <h3 className="font-semibold">{b.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-center text-2xl font-bold">How it works</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center">
              <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {s.n}
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <div className="relative overflow-hidden rounded-3xl border bg-card p-10 text-center">
          <AnimatedWaves className="opacity-60" />
          <div className="relative">
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to start tracking?</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              It takes about a minute to log your first journey. No account required.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link to="/app">
                Open Leicester Footprint <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>Leicester Footprint — a privacy-first, open-source project. Estimates only.</p>
          <a
            href="https://github.com/FavourOsadolorIghede/leicester-footprint"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
            target="_blank"
            rel="noreferrer"
          >
            <Github className="size-4" /> Source
          </a>
        </div>
      </footer>
    </div>
  );
}
