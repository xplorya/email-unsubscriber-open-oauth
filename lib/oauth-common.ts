import type { Env, TokenExchangeRequest, TokenExchangeResponse } from './types';

/**
 * Configuration for an OAuth provider
 */
export interface OAuthProviderConfig {
  tokenEndpoint: string;
  clientIdKey: keyof Env;
  clientSecretKey: keyof Env;
  providerName: string;
}

/**
 * Error response structure from OAuth providers
 */
interface OAuthErrorResponse {
  error: string;
  error_description: string;
}

/**
 * Exchanges an authorization code for tokens using the configured OAuth provider.
 *
 * @param req - The token exchange request
 * @param env - Worker environment bindings
 * @param config - Provider-specific configuration
 * @returns Token response from the provider
 * @throws Error if the exchange fails
 */
export async function exchangeCode(
  req: TokenExchangeRequest,
  env: Env,
  config: OAuthProviderConfig
): Promise<TokenExchangeResponse> {
  const clientId = env[config.clientIdKey];
  const clientSecret = env[config.clientSecretKey];

  if (!clientId) {
    throw new Error(`${config.clientIdKey} is not configured`);
  }
  if (!clientSecret) {
    throw new Error(`${config.clientSecretKey} is not configured`);
  }

  // Build form data for token exchange
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: req.code,
    redirect_uri: req.redirect_uri,
    grant_type: 'authorization_code',
  });

  if (req.code_verifier) {
    params.set('code_verifier', req.code_verifier);
  }

  // Execute the request
  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const body = await response.text();

  // Check for error response
  if (!response.ok) {
    let errorMessage = `Token exchange failed with status ${response.status}`;
    try {
      const errResp: OAuthErrorResponse = JSON.parse(body);
      errorMessage = `Token exchange failed: ${errResp.error} - ${errResp.error_description}`;
    } catch {
      errorMessage = `${errorMessage}: ${body}`;
    }
    throw new Error(errorMessage);
  }

  // Parse successful response
  const tokenResp: TokenExchangeResponse = JSON.parse(body);

  // Validate critical fields are present
  if (!tokenResp.access_token) {
    throw new Error('access_token missing in token response');
  }
  if (!tokenResp.id_token) {
    throw new Error('id_token missing in token response');
  }

  return tokenResp;
}
