/**
 * CRA injects `PUBLIC_URL` at build time when the app is hosted under a subpath
 * (e.g. GitHub Pages: https://owner.github.io/repo-name/).
 */
export function getAppBasePath() {
  const raw = process.env.PUBLIC_URL || "";
  const trimmed = raw.replace(/\/$/, "");
  if (!trimmed || trimmed === "/") {
    return "";
  }
  return trimmed;
}

/** Full path for `window.location` (bypasses React Router basename). */
export function appPath(relativePath) {
  const segment = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  const base = getAppBasePath();
  return `${base}${segment}`;
}
