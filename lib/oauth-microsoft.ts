import type { Env, TokenExchangeRequest, TokenExchangeResponse } from './types';
import { exchangeCode, OAuthProviderConfig } from './oauth-common';

const microsoftConfig: OAuthProviderConfig = {
  tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  clientIdKey: 'MICROSOFT_OAUTH_CLIENT_ID',
  clientSecretKey: 'MICROSOFT_OAUTH_CLIENT_SECRET',
  providerName: 'Microsoft',
};

/**
 * Exchanges an authorization code for tokens using Microsoft's OAuth endpoint.
 *
 * @param req - The token exchange request
 * @param env - Worker environment bindings
 * @returns Token response from Microsoft
 * @throws Error if the exchange fails
 */
export async function exchangeCodeMicrosoft(
  req: TokenExchangeRequest,
  env: Env
): Promise<TokenExchangeResponse> {
  return exchangeCode(req, env, microsoftConfig);
}
