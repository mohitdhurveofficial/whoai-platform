import { GatewayError, providerFetch, ProviderFetchOptions } from "../http";
import { KeyCheckResult } from "./types";

// Run a provider auth-check request and map the outcome to a KeyCheckResult.
// A 2xx response means the key authenticates. A 401/403 means the key is
// invalid/unauthorized. Anything else (timeout, 5xx, network) is reported as a
// failed check with a human-readable detail — the caller treats the credential
// as not-connected and the user can retry. The key is never logged here.
export async function runAuthCheck(
  url: string,
  init: RequestInit,
  opts: ProviderFetchOptions,
): Promise<KeyCheckResult> {
  try {
    await providerFetch(url, init, { timeoutMs: 10_000, retries: 1, ...opts });
    return { ok: true };
  } catch (err) {
    if (err instanceof GatewayError) {
      if (err.status === 401 || err.status === 403) {
        return { ok: false, detail: "Authentication failed — the key was rejected." };
      }
      return { ok: false, detail: err.message };
    }
    return {
      ok: false,
      detail: err instanceof Error ? err.message : "Connection test failed",
    };
  }
}
