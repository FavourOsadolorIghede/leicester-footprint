import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils.js';
import { Card, CardContent } from './ui/card.jsx';
import { Button } from './ui/button.jsx';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, children, className }) {
  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center px-6 py-12 text-center">
        {Icon && (
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-7" />
          </div>
        )}
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
        {children && <div className="mt-6 w-full">{children}</div>}
      </CardContent>
    </Card>
  );
}

export function StatCard({ title, value, unit, icon: Icon, tone = 'primary', hint }) {
  const tones = {
    primary: 'bg-primary/10 text-primary',
    travel: 'bg-cat-travel/15 text-cat-travel',
    energy: 'bg-cat-energy/15 text-cat-energy',
    food: 'bg-cat-food/15 text-cat-food',
  };
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold sm:text-3xl">{value}</span>
              {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
            </p>
            {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
          </div>
          {Icon && (
            <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl', tones[tone])}>
              <Icon className="size-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ActionCard({ to, icon: Icon, title, description }) {
  return (
    <Link to={to} className="group block">
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
            <Icon className="size-5" />
          </div>
          <p className="font-semibold">{title}</p>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </CardContent>
      </Card>
    </Link>
  );
}

export function ConfidenceBadge({ level }) {
  const map = {
    high: 'bg-cat-food/15 text-cat-food',
    medium: 'bg-cat-energy/15 text-cat-energy',
    low: 'bg-muted text-muted-foreground',
  };
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium capitalize', map[level] || map.low)}>
      {level}
    </span>
  );
}

export function Estimate({ className }) {
  return (
    <p className={cn('text-xs text-muted-foreground', className)}>
      All figures are <strong>estimates</strong> based on UK average factors, not exact measurements.
    </p>
  );
}

export function FadeIn({ children, delay = 0, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function BackLink({ to = '/app', children = 'Back' }) {
  return (
    <Button variant="ghost" size="sm" asChild>
      <Link to={to}>{children}</Link>
    </Button>
  );
}
