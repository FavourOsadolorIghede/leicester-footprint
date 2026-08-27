/**
 * Environment detection.
 *
 * "App mode" = the site is running as an installed / standalone PWA (or was
 * opened with ?app=1). In app mode we enable the bottom tab bar, zoom-lock and
 * GPS trip auto-detect. In a normal browser tab none of that applies — and we
 * never disable zoom for regular web visitors (accessibility).
 */

export function isMobileApp() {
  if (typeof window === 'undefined') return false;
  try {
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      new URLSearchParams(window.location.search).get('app') === '1';
    return Boolean(standalone);
  } catch {
    return false;
  }
}

export function isTouchDevice() {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/** Stamp <html data-app-mode> once at startup so CSS can react to it. */
export function markAppMode() {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.appMode = String(isMobileApp());
}
