import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

const STORAGE_KEY = 'stroika_theme_mode';

function readPreference() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark') return v;
  } catch {
    /* ignore */
  }
  return 'system';
}

function writePreference(next) {
  try {
    if (next === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, next);
    }
  } catch {
    /* ignore */
  }
}

function subscribeSystemDark(callback) {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getSystemDarkSnapshot() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getSystemDarkServerSnapshot() {
  return false;
}

const ThemeModeContext = createContext({
  preference: 'system',
  resolvedMode: 'light',
  cycleMode: () => {},
  /** @param {'system'|'light'|'dark'} mode */
  setPreferenceMode: () => {},
  resetPreferenceToSystem: () => {},
});

export function ThemeModeProvider({ children }) {
  const [preference, setPreference] = useState(readPreference);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY || e.key == null) {
        setPreference(readPreference());
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const systemIsDark = useSyncExternalStore(
    subscribeSystemDark,
    getSystemDarkSnapshot,
    getSystemDarkServerSnapshot
  );

  const resolvedMode = useMemo(() => {
    if (preference === 'dark') return 'dark';
    if (preference === 'light') return 'light';
    return systemIsDark ? 'dark' : 'light';
  }, [preference, systemIsDark]);

  /** Sync class + color-scheme before paint so light mode is not stuck with OS dark native styling. */
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedMode === 'dark');
    root.style.colorScheme = resolvedMode === 'dark' ? 'dark' : 'light';
  }, [resolvedMode]);

  const cycleMode = useCallback(() => {
    setPreference((prev) => {
      let next;
      if (prev === 'system') next = 'light';
      else if (prev === 'light') next = 'dark';
      else next = 'system';
      writePreference(next);
      return next;
    });
  }, []);

  const setPreferenceMode = useCallback((mode) => {
    if (mode !== 'system' && mode !== 'light' && mode !== 'dark') return;
    writePreference(mode);
    setPreference(mode);
  }, []);

  const resetPreferenceToSystem = useCallback(() => {
    writePreference('system');
    setPreference('system');
  }, []);

  const value = useMemo(
    () => ({
      preference,
      resolvedMode,
      cycleMode,
      setPreferenceMode,
      resetPreferenceToSystem,
    }),
    [preference, resolvedMode, cycleMode, setPreferenceMode, resetPreferenceToSystem]
  );

  return (
    <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
