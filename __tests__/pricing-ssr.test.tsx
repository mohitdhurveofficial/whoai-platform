import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CountUp } from "@/components/marketing/Motion";
import plansData from "@/plans.json";

/**
 * The pricing page is the one page whose numbers must be correct in the first
 * byte of HTML. CountUp used to initialise its state to 0 and only reach the
 * real figure after hydration, so the server sent "$0 / month" for Starter,
 * Growth and Business while the JSON-LD in the same document said $149, $499
 * and $1,499. Crawlers and anyone without JavaScript read the 0.
 */
describe("server-rendered numbers", () => {
  it("renders the real value, not a zero waiting for hydration", () => {
    expect(renderToStaticMarkup(<CountUp value={149} prefix="$" />)).toContain("$149");
  });

  it("formats large numbers without waiting for the browser", () => {
    expect(renderToStaticMarkup(<CountUp value={1499} prefix="$" />)).toContain("$1,499");
  });

  it("never emits a bare 0 for a non-zero value", () => {
    const html = renderToStaticMarkup(<CountUp value={74} suffix="%" />);
    expect(html).toContain("74%");
    expect(html).not.toContain(">0<");
  });

  it("keeps suffixes and decimals intact", () => {
    expect(renderToStaticMarkup(<CountUp value={2.5} suffix="x" decimals={1} />)).toContain("2.5x");
  });
});

describe("advertised prices", () => {
  it("match plans.json, which is what checkout and the gateway enforce", () => {
    // A price shown on the page that no plan actually charges is a promise the
    // billing code cannot keep.
    expect(plansData.plans.STARTER.priceMonthly).toBe(149);
    expect(plansData.plans.GROWTH.priceMonthly).toBe(499);
    expect(plansData.plans.BUSINESS.priceMonthly).toBe(1499);
    expect(plansData.plans.FREE.priceMonthly).toBe(0);
    expect(plansData.plans.ENTERPRISE.priceMonthly).toBeNull();
  });
});
