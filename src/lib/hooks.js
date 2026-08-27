import { useCallback, useEffect, useRef, useState } from 'react';
import {
  onChange,
  journeys,
  energyReadings,
  receipts,
  getSettings,
  saveSettings,
} from './db.js';
import { inPeriod, last8WeekBuckets } from './format.js';
import { isMobileApp } from './environment.js';

/** Live list from a collection, kept in sync with writes anywhere in the app. */
export function useCollection(coll, storeName) {
  const [rows, setRows] = useState(null);

  const refresh = useCallback(() => {
    coll.list().then(setRows);
  }, [coll]);

  useEffect(() => {
    refresh();
    return onChange(storeName, refresh);
  }, [refresh, storeName]);

  return { rows: rows || [], loading: rows === null, refresh };
}

export function useSettings() {
  const [settings, setSettings] = useState(getSettings);

  useEffect(() => onChange('settings', () => setSettings(getSettings())), []);

  const update = useCallback((patch) => setSettings(saveSettings(patch)), []);
  return [settings, update];
}

/** Totals by category for a period + an 8-week trend series. */
export function useDashboardData(period = 'week') {
  const [data, setData] = useState({
    travel: 0,
    energy: 0,
    food: 0,
    total: 0,
    trend: [],
    counts: { journeys: 0, energy: 0, receipts: 0 },
    loading: true,
  });

  const compute = useCallback(async () => {
    const [j, e, r] = await Promise.all([
      journeys.list(),
      energyReadings.list(),
      receipts.list(),
    ]);

    const now = new Date();
    const sum = (list, key) =>
      list.filter((x) => inPeriod(x.createdAt, period, now)).reduce((acc, x) => acc + (x[key] || 0), 0);

    const travel = sum(j, 'co2eKg');
    const energy = sum(e, 'co2eKg');
    const food = sum(r, 'totalCo2eKg');

    const buckets = last8WeekBuckets(now);
    const addToTrend = (list, key) => {
      for (const row of list) {
        const d = new Date(row.createdAt);
        const b = buckets.find((bk) => d >= bk.start && d < bk.end);
        if (b) b.total += row[key] || 0;
      }
    };
    addToTrend(j, 'co2eKg');
    addToTrend(e, 'co2eKg');
    addToTrend(r, 'totalCo2eKg');

    setData({
      travel,
      energy,
      food,
      total: travel + energy + food,
      trend: buckets.map((b) => ({ label: b.label, total: Math.round(b.total * 10) / 10 })),
      counts: { journeys: j.length, energy: e.length, receipts: r.length },
      loading: false,
    });
  }, [period]);

  useEffect(() => {
    compute();
    const offs = ['journeys', 'energyReadings', 'receipts'].map((s) => onChange(s, compute));
    return () => offs.forEach((off) => off());
  }, [compute]);

  return data;
}

/** Pull-to-refresh for touch / app mode. Returns bindings + live pull distance. */
export function usePullToRefresh(onRefresh, { enabled = true } = {}) {
  const [pull, setPull] = useState(0);
  const startY = useRef(0);
  const active = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    const onStart = (e) => {
      if (window.scrollY <= 0) {
        startY.current = e.touches[0].clientY;
        active.current = true;
      }
    };
    const onMove = (e) => {
      if (!active.current) return;
      const delta = e.touches[0].clientY - startY.current;
      if (delta > 0) setPull(Math.min(90, delta));
    };
    const onEnd = async () => {
      if (!active.current) return;
      active.current = false;
      if (pull > 60) await onRefresh?.();
      setPull(0);
    };

    document.addEventListener('touchstart', onStart, { passive: true });
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      document.removeEventListener('touchstart', onStart);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
  }, [enabled, onRefresh, pull]);

  return { pull, isPulling: pull > 0 };
}

/** Prevent pinch / double-tap / ctrl-wheel zoom — ONLY in installed app mode. */
export function useZoomLock() {
  useEffect(() => {
    if (!isMobileApp()) return undefined;

    const prevent = (e) => e.preventDefault();
    const onWheel = (e) => {
      if (e.ctrlKey) e.preventDefault();
    };
    let lastTouch = 0;
    const onTouchEnd = (e) => {
      const now = Date.now();
      if (now - lastTouch <= 300) e.preventDefault();
      lastTouch = now;
    };

    document.addEventListener('gesturestart', prevent);
    document.addEventListener('gesturechange', prevent);
    document.addEventListener('gestureend', prevent);
    document.addEventListener('wheel', onWheel, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: false });
    return () => {
      document.removeEventListener('gesturestart', prevent);
      document.removeEventListener('gesturechange', prevent);
      document.removeEventListener('gestureend', prevent);
      document.removeEventListener('wheel', onWheel);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, []);
}
