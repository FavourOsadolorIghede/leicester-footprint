import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  subWeeks,
  format,
  isAfter,
} from 'date-fns';

export function periodStart(period, now = new Date()) {
  switch (period) {
    case 'week':
      return startOfWeek(now, { weekStartsOn: 1 });
    case 'month':
      return startOfMonth(now);
    case 'year':
      return startOfYear(now);
    default:
      return new Date(0);
  }
}

export function inPeriod(dateLike, period, now = new Date()) {
  return isAfter(new Date(dateLike), periodStart(period, now));
}

/** Buckets for an 8-week trend chart, oldest → newest. */
export function last8WeekBuckets(now = new Date()) {
  const buckets = [];
  for (let i = 7; i >= 0; i--) {
    const start = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const end = startOfWeek(subWeeks(now, i - 1), { weekStartsOn: 1 });
    buckets.push({ label: format(start, 'd MMM'), start, end, total: 0 });
  }
  return buckets;
}

export function kg(n, dp = 1) {
  const v = Number(n) || 0;
  return `${v.toFixed(dp)} kg`;
}

export function gbp(n) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Number(n) || 0);
}

export function relativeDate(dateLike) {
  return format(new Date(dateLike), 'd MMM yyyy');
}
