import { alpha, darken, lighten } from '@mui/material/styles';

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  let s = hex.trim();
  if (!s.startsWith('#')) s = `#${s}`;
  if (!/^#[0-9A-Fa-f]{6}$/.test(s)) return null;
  const n = parseInt(s.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** WCAG relative luminance for sRGB hex color */
export function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;
  const lin = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const r = lin(rgb.r);
  const g = lin(rgb.g);
  const b = lin(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Primary palette for light vs dark surfaces: dark brand colors are lifted in dark mode;
 * very light brand colors are slightly toned down for contrast on dark grey.
 */
export function getBrandPrimary(brandColor, mode) {
  const L = relativeLuminance(brandColor);

  if (mode === 'light') {
    return {
      main: brandColor,
      light: lighten(brandColor, 0.15),
      dark: darken(brandColor, 0.2),
      contrastText: L > 0.55 ? '#1a1a1a' : '#ffffff',
    };
  }

  let main = brandColor;
  if (L < 0.18) {
    main = lighten(brandColor, 0.48);
  } else if (L > 0.62) {
    main = darken(brandColor, 0.14);
  } else {
    main = lighten(brandColor, 0.22);
  }

  const Lm = relativeLuminance(main);
  return {
    main,
    light: lighten(main, 0.14),
    dark: darken(main, 0.12),
    contrastText: Lm > 0.55 ? '#0d0d0f' : '#ffffff',
  };
}

export function tableHeadBg(theme) {
  return theme.palette.mode === 'dark'
    ? alpha(theme.palette.common.white, 0.06)
    : alpha(theme.palette.common.black, 0.04);
}
