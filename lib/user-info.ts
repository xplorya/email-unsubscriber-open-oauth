import type { Env, UserInfoResult } from './types';

/**
 * Fetches user info from the backend user info service using the ID token.
 * Returns both the HTTP status and parsed body regardless of success or failure,
 * so the Worker can forward the backend response transparently without inspecting it.
 *
 * @param idToken - The ID token from the OAuth provider
 * @param env - Worker environment bindings
 * @param referralCode - Optional referral code to forward to the backend
 * @returns The backend's HTTP status and parsed response body
 * @throws {Error} only if the network request itself fails (fetch throws)
 */
export async function fetchUserInfo(idToken: string, env: Env, referralCode?: string): Promise<UserInfoResult> {
  const userInfoUrl = `${env.USER_INFO_SERVICE_URL}/user/info`;

  const headers: Record<string, string> = {
    'x-auth-token': idToken,
  };

  if (referralCode) {
    headers['x-referral-code'] = referralCode;
  }

  const response = await fetch(userInfoUrl, {
    method: 'GET',
    headers,
  });

  const text = await response.text();

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    // If the backend returned non-JSON, wrap the raw text
    body = { raw_response: text };
  }

  return { status: response.status, body };
}
