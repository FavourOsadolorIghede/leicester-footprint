/**
 * Local data layer.
 *
 * Everything the user logs lives in IndexedDB on their own device. There is no
 * server, no account and no network call. `localStorage` is used only for tiny
 * preferences (theme, onboarding-seen).
 *
 * Each collection exposes list / get / add / update / remove / clear and emits a
 * change event so React views stay in sync (see `useCollection`).
 */

import { openDB } from 'idb';
import { uid } from './utils.js';

const DB_NAME = 'leicester-footprint';
const DB_VERSION = 1;

export const STORES = {
  journeys: 'journeys',
  energyReadings: 'energyReadings',
  receipts: 'receipts',
  receiptItems: 'receiptItems',
  products: 'products',
  groups: 'groups',
  challengeCompletions: 'challengeCompletions',
  placeSuggestions: 'placeSuggestions',
};

let _dbPromise = null;

function db() {
  if (!_dbPromise) {
    _dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        for (const name of Object.values(STORES)) {
          if (!database.objectStoreNames.contains(name)) {
            const store = database.createObjectStore(name, { keyPath: 'id' });
            store.createIndex('createdAt', 'createdAt');
          }
        }
      },
    });
  }
  return _dbPromise;
}

// ---- change notifications -------------------------------------------------

const target = new EventTarget();

export function onChange(store, handler) {
  const listener = (e) => {
    if (!store || e.detail === store) handler(e.detail);
  };
  target.addEventListener('change', listener);
  return () => target.removeEventListener('change', listener);
}

function emit(store) {
  target.dispatchEvent(new CustomEvent('change', { detail: store }));
}

// ---- generic collection API --------------------------------------------------

function collection(store) {
  return {
    async list() {
      const all = await (await db()).getAll(store);
      return all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    async get(id) {
      return (await db()).get(store, id);
    },
    async add(record) {
      const now = new Date().toISOString();
      const row = { id: uid(store.slice(0, 3)), createdAt: now, updatedAt: now, ...record };
      await (await db()).put(store, row);
      emit(store);
      return row;
    },
    async update(id, patch) {
      const current = await (await db()).get(store, id);
      if (!current) return null;
      const row = { ...current, ...patch, updatedAt: new Date().toISOString() };
      await (await db()).put(store, row);
      emit(store);
      return row;
    },
    async remove(id) {
      await (await db()).delete(store, id);
      emit(store);
    },
    async clear() {
      await (await db()).clear(store);
      emit(store);
    },
  };
}

export const journeys = collection(STORES.journeys);
export const energyReadings = collection(STORES.energyReadings);
export const receipts = collection(STORES.receipts);
export const receiptItems = collection(STORES.receiptItems);
export const products = collection(STORES.products);
export const groups = collection(STORES.groups);
export const challengeCompletions = collection(STORES.challengeCompletions);
export const placeSuggestions = collection(STORES.placeSuggestions);

// ---- import / export --------------------------------------------------------

export async function exportAll() {
  const database = await db();
  const data = {};
  for (const name of Object.values(STORES)) {
    data[name] = await database.getAll(name);
  }
  return {
    app: 'leicester-footprint',
    version: DB_VERSION,
    exportedAt: new Date().toISOString(),
    settings: getSettings(),
    data,
  };
}

export async function importAll(payload, { merge = true } = {}) {
  if (!payload || payload.app !== 'leicester-footprint') {
    throw new Error('This file is not a Leicester Footprint export.');
  }
  const database = await db();
  for (const name of Object.values(STORES)) {
    const rows = payload.data?.[name] || [];
    const tx = database.transaction(name, 'readwrite');
    if (!merge) await tx.store.clear();
    for (const row of rows) await tx.store.put(row);
    await tx.done;
    emit(name);
  }
  if (payload.settings) saveSettings(payload.settings);
}

export async function wipeEverything() {
  const database = await db();
  for (const name of Object.values(STORES)) {
    await database.clear(name);
    emit(name);
  }
  localStorage.removeItem(SETTINGS_KEY);
}

// ---- settings (localStorage) -----------------------------------------------

const SETTINGS_KEY = 'lf.settings';

export const DEFAULT_SETTINGS = {
  displayName: '',
  postcodePrefix: 'LE',
  weeklyTargetKg: 90,
  electricityPricePerKwh: 0.28,
  theme: 'system',
  onboardingDone: false,
};

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    /* storage disabled */
  }
  target.dispatchEvent(new CustomEvent('change', { detail: 'settings' }));
  return next;
}
