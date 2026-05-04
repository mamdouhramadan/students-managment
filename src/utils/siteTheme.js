/** Default brand / primary — matches db.json & MUI theme fallback */
export const DEFAULT_BRAND_COLOR = '#8854d0';

export function normalizeHex(hex) {
  if (hex == null || typeof hex !== 'string') return null;
  let s = hex.trim();
  if (!s.startsWith('#')) s = `#${s}`;
  if (/^#[0-9A-Fa-f]{6}$/.test(s)) return s.toLowerCase();
  return null;
}

/** Updates `:root --main-color` for plain CSS + Tailwind `main` palette */
export function applyBrandColorCss(hex) {
  const BRAND_COLOR = normalizeHex(hex) || DEFAULT_BRAND_COLOR;
  document.documentElement.style.setProperty('--main-color', BRAND_COLOR);
  return BRAND_COLOR;
}
