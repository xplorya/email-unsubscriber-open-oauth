/**
 * Environment bindings for the Cloudflare Worker
 */
export interface Env {
  // Environment variables
  ENVIRONMENT: string;
  USER_INFO_SERVICE_URL: string;
  ALLOWED_REDIRECT_URIS: string;

  // Secrets (set via wrangler secret put)
  GOOGLE_OAUTH_CLIENT_ID: string;
  GOOGLE_OAUTH_CLIENT_SECRET: string;
  MICROSOFT_OAUTH_CLIENT_ID: string;
  MICROSOFT_OAUTH_CLIENT_SECRET: string;
}

/**
 * Incoming request from the webapp OAuth flow
 */
export interface TokenExchangeRequest {
  code: string;
  redirect_uri: string;
  code_verifier?: string;
  provider: 'google' | 'outlook' | 'microsoft';
}

/**
 * Response from OAuth provider token endpoint
 */
export interface TokenExchangeResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
  id_token?: string;
  user_info?: unknown;
}

/**
 * JWT Claims from ID token (partial, for email extraction)
 */
export interface IDTokenClaims {
  email?: string;
  preferred_username?: string;
  upn?: string;
  [key: string]: unknown;
}
