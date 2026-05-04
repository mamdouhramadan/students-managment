import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getPublicSiteTheme } from '../api/api';
import { applyBrandColorCss, DEFAULT_BRAND_COLOR } from '../utils/siteTheme';

const ThemeColorContext = createContext({
  brandColor: DEFAULT_BRAND_COLOR,
  setBrandColor: () => {},
  announcement: '',
});

export function ThemeColorProvider({ children }) {
  const [brandColor, setBrandColorState] = useState(DEFAULT_BRAND_COLOR);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    let cancelled = false;
    getPublicSiteTheme()
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.primaryColorHex) {
          const v = applyBrandColorCss(data.primaryColorHex);
          setBrandColorState(v);
        } else {
          applyBrandColorCss(DEFAULT_BRAND_COLOR);
        }
        const ann =
          typeof data?.announcement === 'string' ? data.announcement.trim() : '';
        setAnnouncement(ann);
      })
      .catch(() => {
        applyBrandColorCss(DEFAULT_BRAND_COLOR);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setBrandColor = useCallback((hex) => {
    const v = applyBrandColorCss(hex);
    setBrandColorState(v);
  }, []);

  const value = useMemo(
    () => ({ brandColor, setBrandColor, announcement }),
    [brandColor, announcement, setBrandColor]
  );

  return (
    <ThemeColorContext.Provider value={value}>{children}</ThemeColorContext.Provider>
  );
}

export function useThemeColor() {
  return useContext(ThemeColorContext);
}
