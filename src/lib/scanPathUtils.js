/**
 * Shared probe/scanner path detection (middleware + admin UI + backend mirror).
 */

const SCAN_RE =
  /(\.env|\.git|\.aws|wp-admin|wp-login|phpmyadmin|xmlrpc|cgi-bin|actuator|\/vendor\/phpunit|\/\.svn|\/\.hg|\.bak$|\.sql($|\?)|credentials|id_rsa|docker-compose|\/adminer|\/telescope|\/debug|server-status|\.DS_Store|web\.config|phpinfo)/i;

export function isSuspectedScanPath(pathname) {
  if (!pathname || typeof pathname !== "string") return false;
  return SCAN_RE.test(pathname);
}

/** Short label for admin UI (ENV / GIT / AWS / WP / PROBE). */
export function scanProbeKind(pathname) {
  if (!pathname || typeof pathname !== "string") return null;
  const p = pathname.toLowerCase();
  if (p.includes(".env")) return "ENV";
  if (p.includes(".git")) return "GIT";
  if (p.includes(".aws")) return "AWS";
  if (p.includes("wp-admin") || p.includes("wp-login")) return "WP";
  if (isSuspectedScanPath(pathname)) return "PROBE";
  return null;
}
