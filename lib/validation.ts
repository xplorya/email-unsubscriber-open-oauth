// Cache for compiled regex patterns to avoid recompilation on every call
const regexCache = new Map<string, RegExp>();

/**
 * Validates that the redirect URI is in the allowlist.
 * This prevents token theft by ensuring tokens are only sent to trusted origins.
 *
 * @param redirectUri - The redirect URI from the token exchange request
 * @param allowedUris - Comma-separated list of allowed URI patterns
 * @returns true if valid, false otherwise
 */
export function validateRedirectUri(redirectUri: string, allowedUris: string): boolean {
  if (!redirectUri) {
    return false;
  }

  const patterns = allowedUris.split(',').map((uri) => uri.trim());

  for (const pattern of patterns) {
    if (matchesPattern(redirectUri, pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Validates that an origin is allowed based on the allowlist.
 * Extracts origin from allowed redirect URIs for CORS validation.
 *
 * @param origin - The Origin header from the request
 * @param allowedUris - Comma-separated list of allowed URI patterns
 * @returns true if origin is allowed, false otherwise
 */
export function isAllowedOrigin(origin: string, allowedUris: string): boolean {
  if (!origin) {
    return false;
  }

  const patterns = allowedUris.split(',').map((uri) => uri.trim());

  for (const pattern of patterns) {
    // Extract origin from pattern (scheme + host + port)
    const patternOrigin = extractOrigin(pattern);
    if (patternOrigin && matchesPattern(origin, patternOrigin)) {
      return true;
    }
  }

  return false;
}

/**
 * Extracts the origin (scheme + host + port) from a URL or pattern.
 *
 * @param urlOrPattern - A URL or URL pattern
 * @returns The origin portion, or null if invalid
 */
function extractOrigin(urlOrPattern: string): string | null {
  try {
    // Handle wildcard patterns by temporarily replacing * for URL parsing
    const testUrl = urlOrPattern.replace(/\*/g, 'WILDCARD');
    const url = new URL(testUrl);
    // Reconstruct with wildcards restored
    const origin = `${url.protocol}//${url.host}`.replace(/WILDCARD/g, '*');
    return origin;
  } catch {
    return null;
  }
}

/**
 * Checks if a URI matches a wildcard pattern.
 * Supports "*" as a wildcard that matches any sequence of characters.
 * Uses cached regex patterns for performance.
 *
 * @param uri - The URI to check
 * @param pattern - The pattern to match against (supports * wildcard)
 * @returns true if matches, false otherwise
 */
function matchesPattern(uri: string, pattern: string): boolean {
  let regex = regexCache.get(pattern);

  if (!regex) {
    // Escape regex special characters, then replace \* with .*
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexPattern = '^' + escaped.replace(/\\\*/g, '.*') + '$';

    try {
      regex = new RegExp(regexPattern);
      regexCache.set(pattern, regex);
    } catch {
      return false;
    }
  }

  return regex.test(uri);
}
