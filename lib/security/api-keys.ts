import crypto from "crypto";

export function generateApiKey() {
  const secret = crypto.randomBytes(32).toString("hex");

  return {
    plainText: `wk_live_${secret}`,
    hash: crypto
      .createHash("sha256")
      .update(`wk_live_${secret}`)
      .digest("hex"),
  };
}