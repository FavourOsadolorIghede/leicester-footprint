import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind-aware className combiner. */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** 6-char human-friendly code (no ambiguous chars). */
export function joinCode() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export const roundKg = (n) => Math.round((Number(n) || 0) * 100) / 100;

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}
