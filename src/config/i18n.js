/** Supported app locale codes */
export const SUPPORTED_LOCALES = ['en', 'ar'];

export const LOCALE_STORAGE_KEY = 'stroika-language';

/** BCP-47 → app locale */
export function normalizeLocale(raw) {
  if (!raw || typeof raw !== 'string') return 'en';
  const lower = raw.toLowerCase();
  if (lower.startsWith('ar')) return 'ar';
  if (lower.startsWith('en')) return 'en';
  return 'en';
}

export function getBrowserLocale() {
  if (typeof navigator === 'undefined') return 'en';
  const list = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of list) {
    const n = normalizeLocale(lang);
    if (SUPPORTED_LOCALES.includes(n)) return n;
  }
  return normalizeLocale(navigator.language);
}

export function isRTL(locale) {
  return locale === 'ar';
}
