"use client";

import { useState } from "react";
import Link from "next/link";

/* ============================================================================
 * PAYMENT CONFIG — edit these before going live.
 * ----------------------------------------------------------------------------
 * Crypto is sent directly to YOUR wallet (non-custodial). Until you set a real
 * `receivingAddress`, the crypto button stays disabled so funds can't be lost.
 * Default chain/token: USDC on Base (cheap fees, widely held). Swap as needed.
 * ========================================================================== */
const PAYMENT = {
  product: "AI Teardown + Setup",
  amountUsd: 2000,
  lineItems: [
    "Full AI spend teardown report",
    "Cheaper-model routing + retry guards configured",
    "Budget caps + runaway kill-switch wired",
    "Savings verified on your live traffic",
  ],
  // ⬇️ Set NEXT_PUBLIC_RECEIVING_ADDRESS (0x...) to enable crypto. Falls back to the
  //    zero-address placeholder, which keeps the crypto button disabled (no funds lost).
  receivingAddress:
    process.env.NEXT_PUBLIC_RECEIVING_ADDRESS ||
    "0x0000000000000000000000000000000000000000",
  chain: {
    id: 8453,
    hexId: "0x2105",
    name: "Base",
    rpc: "https://mainnet.base.org",
    explorer: "https://basescan.org",
    nativeSymbol: "ETH",
  },
  token: {
    symbol: "USDC",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
    decimals: 6,
  },
  // ⬇️ OPTIONAL: set NEXT_PUBLIC_STRIPE_PAYMENT_LINK for the card option. Empty disables it.
  stripePaymentLink: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || "",
};

// ----- minimal EIP-1193 helpers (no web3 library needed) --------------------
function getEthereum(): any {
  return typeof window !== "undefined" ? (window as any).ethereum : undefined;
}

function pad32(hexNo0x: string): string {
  return hexNo0x.padStart(64, "0");
}

/** Encode ERC-20 transfer(address,uint256) calldata. */
function encodeErc20Transfer(to: string, amount: bigint): string {
  const selector = "a9059cbb";
  const addr = pad32(to.toLowerCase().replace(/^0x/, ""));
  const amt = pad32(amount.toString(16));
  return "0x" + selector + addr + amt;
}

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export default function CheckoutPage() {
  const [tab, setTab] = useState<"crypto" | "card">("crypto");
  const [account, setAccount] = useState<string | null>(null);
  const [status, setStatus] = useState<{ kind: "idle" | "working" | "error" | "success"; msg: string }>({
    kind: "idle",
    msg: "",
  });
  const [txHash, setTxHash] = useState<string | null>(null);

  const cryptoDisabled =
    PAYMENT.receivingAddress === "0x0000000000000000000000000000000000000000";

  async function connect() {
    const eth = getEthereum();
    if (!eth) {
      setStatus({ kind: "error", msg: "No wallet found. Install MetaMask or a Web3 wallet to pay with crypto." });
      return;
    }
    try {
      setStatus({ kind: "working", msg: "Connecting wallet…" });
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      setStatus({ kind: "idle", msg: "" });
    } catch {
      setStatus({ kind: "error", msg: "Wallet connection was rejected." });
    }
  }

  async function ensureChain(eth: any) {
    const current: string = await eth.request({ method: "eth_chainId" });
    if (current?.toLowerCase() === PAYMENT.chain.hexId.toLowerCase()) return;
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: PAYMENT.chain.hexId }],
      });
    } catch (err: any) {
      // 4902 = chain not added to the wallet yet.
      if (err?.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: PAYMENT.chain.hexId,
              chainName: PAYMENT.chain.name,
              rpcUrls: [PAYMENT.chain.rpc],
              blockExplorerUrls: [PAYMENT.chain.explorer],
              nativeCurrency: { name: PAYMENT.chain.nativeSymbol, symbol: PAYMENT.chain.nativeSymbol, decimals: 18 },
            },
          ],
        });
      } else {
        throw err;
      }
    }
  }

  async function payCrypto() {
    const eth = getEthereum();
    if (!eth || !account) return;
    if (cryptoDisabled) {
      setStatus({ kind: "error", msg: "Crypto receiving address not configured yet." });
      return;
    }
    try {
      setStatus({ kind: "working", msg: `Confirm the ${PAYMENT.token.symbol} payment in your wallet…` });
      await ensureChain(eth);

      const amount = BigInt(PAYMENT.amountUsd) * 10n ** BigInt(PAYMENT.token.decimals);
      const data = encodeErc20Transfer(PAYMENT.receivingAddress, amount);

      const hash: string = await eth.request({
        method: "eth_sendTransaction",
        params: [{ from: account, to: PAYMENT.token.address, data }],
      });

      setTxHash(hash);
      setStatus({ kind: "success", msg: "Payment sent! We'll confirm and kick off your teardown." });
    } catch (err: any) {
      setStatus({ kind: "error", msg: err?.message?.slice(0, 140) || "Payment failed or was rejected." });
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#06080F] text-white relative overflow-hidden flex items-center justify-center px-4 py-10">
      {/* ambient web3 glows */}
      <div className="pointer-events-none absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full bg-[#6D5DFB]/25 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-[520px] w-[520px] rounded-full bg-[#2BD4FF]/20 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-[#FF6B00]/15 blur-[110px]" />

      <div className="relative w-full max-w-[440px]">
        {/* brand row */}
        <div className="flex items-center justify-between mb-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#6D5DFB] to-[#2BD4FF] text-[12px] font-bold text-white">
              W
            </div>
            <span className="text-[15px] font-semibold tracking-tight">WHOAI</span>
          </Link>
          <span className="text-[12px] text-[#7E8AA0]">Secure checkout</span>
        </div>

        {/* glass card */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          {/* order summary */}
          <div className="mb-6">
            <p className="text-[12px] uppercase tracking-widest text-[#7E8AA0] mb-2">You&apos;re paying for</p>
            <div className="flex items-baseline justify-between">
              <h1 className="text-[20px] font-semibold">{PAYMENT.product}</h1>
              <div className="text-right">
                <p className="text-[26px] font-bold leading-none bg-gradient-to-r from-[#9C8CFF] to-[#2BD4FF] bg-clip-text text-transparent">
                  ${PAYMENT.amountUsd.toLocaleString()}
                </p>
                <p className="text-[11px] text-[#7E8AA0] mt-1">one-time</p>
              </div>
            </div>
            <ul className="mt-4 space-y-1.5">
              {PAYMENT.lineItems.map((li) => (
                <li key={li} className="flex items-start gap-2 text-[13px] text-[#B9C2D0]">
                  <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2BD4FF]" />
                  {li}
                </li>
              ))}
            </ul>
          </div>

          {/* method toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10 mb-5">
            <button
              onClick={() => setTab("crypto")}
              className={`rounded-lg py-2 text-[13px] font-medium transition-colors ${
                tab === "crypto" ? "bg-white/10 text-white" : "text-[#7E8AA0] hover:text-white"
              }`}
            >
              Pay with crypto
            </button>
            <button
              onClick={() => setTab("card")}
              className={`rounded-lg py-2 text-[13px] font-medium transition-colors ${
                tab === "card" ? "bg-white/10 text-white" : "text-[#7E8AA0] hover:text-white"
              }`}
            >
              Pay with card
            </button>
          </div>

          {/* crypto pane */}
          {tab === "crypto" && (
            <div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 mb-4">
                <span className="text-[13px] text-[#B9C2D0]">
                  {PAYMENT.amountUsd.toLocaleString()} {PAYMENT.token.symbol} on {PAYMENT.chain.name}
                </span>
                <span className="text-[11px] text-[#7E8AA0]">~${PAYMENT.amountUsd.toLocaleString()}</span>
              </div>

              {!account ? (
                <button
                  onClick={connect}
                  className="w-full rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#2BD4FF] py-3.5 text-[15px] font-semibold text-white hover:opacity-90 transition-opacity"
                >
                  Connect wallet
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <span className="text-[12px] text-[#7E8AA0]">Connected</span>
                    <span className="text-[13px] font-medium text-white">{short(account)}</span>
                  </div>
                  <button
                    onClick={payCrypto}
                    disabled={cryptoDisabled || status.kind === "working"}
                    className="w-full rounded-xl bg-gradient-to-r from-[#6D5DFB] to-[#2BD4FF] py-3.5 text-[15px] font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {status.kind === "working"
                      ? "Confirm in wallet…"
                      : `Pay ${PAYMENT.amountUsd.toLocaleString()} ${PAYMENT.token.symbol}`}
                  </button>
                  {cryptoDisabled && (
                    <p className="text-[11px] text-[#E0A23C] text-center">
                      Receiving wallet not set yet — configure it to enable payment.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* card pane */}
          {tab === "card" && (
            <div>
              {PAYMENT.stripePaymentLink ? (
                <a
                  href={PAYMENT.stripePaymentLink}
                  className="block w-full rounded-xl bg-white py-3.5 text-center text-[15px] font-semibold text-[#06080F] hover:bg-[#EAEAEA] transition-colors"
                >
                  Continue to card payment
                </a>
              ) : (
                <p className="text-[12px] text-[#E0A23C] text-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
                  Add your Stripe Payment Link in the config to enable card payments.
                </p>
              )}
            </div>
          )}

          {/* status */}
          {status.msg && (
            <p
              className={`mt-4 text-[12px] text-center ${
                status.kind === "error"
                  ? "text-[#FF8A8A]"
                  : status.kind === "success"
                  ? "text-[#5BE3B3]"
                  : "text-[#7E8AA0]"
              }`}
            >
              {status.msg}
            </p>
          )}
          {txHash && (
            <a
              href={`${PAYMENT.chain.explorer}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block text-[12px] text-center text-[#2BD4FF] hover:underline"
            >
              View transaction ↗
            </a>
          )}
        </div>

        <p className="mt-4 text-center text-[11px] text-[#5A647A]">
          Payments are non-custodial — crypto goes directly to WHOAI. Powered by WHOAI.
        </p>
      </div>
    </div>
  );
}
