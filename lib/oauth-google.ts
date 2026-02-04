import type { Env, TokenExchangeRequest, TokenExchangeResponse } from './types';
import { exchangeCode, OAuthProviderConfig } from './oauth-common';

const googleConfig: OAuthProviderConfig = {
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  clientIdKey: 'GOOGLE_OAUTH_CLIENT_ID',
  clientSecretKey: 'GOOGLE_OAUTH_CLIENT_SECRET',
  providerName: 'Google',
};

/**
 * Exchanges an authorization code for tokens using Google's OAuth endpoint.
 *
 * @param req - The token exchange request
 * @param env - Worker environment bindings
 * @returns Token response from Google
 * @throws Error if the exchange fails
 */
export async function exchangeCodeGoogle(
  req: TokenExchangeRequest,
  env: Env
): Promise<TokenExchangeResponse> {
  return exchangeCode(req, env, googleConfig);
}
