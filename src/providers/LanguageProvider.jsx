import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import enUS from 'date-fns/locale/en-US';
import arSA from 'date-fns/locale/ar-SA';
import {
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  getBrowserLocale,
  isRTL,
  normalizeLocale,
} from '../config/i18n';
import enMessages from '../locales/en.json';
import arMessages from '../locales/ar.json';

const MESSAGES = { en: enMessages, ar: arMessages };
const DATE_LOCALES = { en: enUS, ar: arSA };

const LanguageContext = createContext(null);

function readStoredLocale() {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (!raw) return null;
    const n = normalizeLocale(raw);
    return SUPPORTED_LOCALES.includes(n) ? n : null;
  } catch {
    return null;
  }
}

function getNested(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

function applyVars(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return Object.keys(vars).reduce(
    (s, k) => s.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(vars[k] ?? '')),
    str
  );
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => readStoredLocale() ?? getBrowserLocale());

  const setLanguage = useCallback((next) => {
    const n = normalizeLocale(next);
    if (!SUPPORTED_LOCALES.includes(n)) return;
    setLanguageState(n);
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, n);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const rtl = isRTL(language);
    document.documentElement.setAttribute('lang', language === 'ar' ? 'ar' : 'en');
    document.documentElement.setAttribute('dir', rtl ? 'rtl' : 'ltr');
  }, [language]);

  const t = useCallback(
    (key, vars) => {
      let msg = getNested(MESSAGES[language], key);
      if (typeof msg !== 'string') {
        msg = getNested(MESSAGES.en, key);
      }
      if (typeof msg !== 'string') return key;
      return applyVars(msg, vars);
    },
    [language]
  );

  const direction = isRTL(language) ? 'rtl' : 'ltr';
  const dateLocale = DATE_LOCALES[language] ?? enUS;

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      direction,
      dateLocale,
      isRTL: isRTL(language),
    }),
    [language, setLanguage, t, direction, dateLocale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
