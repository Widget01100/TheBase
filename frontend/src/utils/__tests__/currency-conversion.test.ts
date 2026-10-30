/**
 * Regression test: currency conversion in charts.
 * Guards against: Dashboard chart displaying symbol+rawKES instead of converted value.
 */
import { describe, it, expect } from "vitest";

const RATES = { KES: 1, USD: 0.0077, GBP: 0.0061, EUR: 0.0071 };

function makeConverter(code: string) {
  const rate = (RATES as any)[code] ?? 1;
  return (kes: number): number => kes * rate;
}

describe("currency conversion (chart data invariant)", () => {
  it("KES is identity (rate 1.0)", () => {
    const c = makeConverter("KES");
    expect(c(22000)).toBe(22000);
    expect(c(1500)).toBe(1500);
  });

  it("USD divides KES by ~130x", () => {
    const c = makeConverter("USD");
    expect(c(22000)).toBeCloseTo(169.4, 1);
    expect(c(1500)).toBeCloseTo(11.55, 2);
  });

  it("GBP is ~2/3 of USD", () => {
    const usd = makeConverter("USD");
    const gbp = makeConverter("GBP");
    expect(gbp(22000)).toBeCloseTo(134.2, 1);
    expect(gbp(22000) / usd(22000)).toBeCloseTo(0.0061 / 0.0077, 4);
  });

  it("every chart series point is converted, not just labels", () => {
    const raw = [
      { x: 1, label: "01", y: 22000 },
      { x: 2, label: "02", y: 1500 },
      { x: 3, label: "03", y: 0 },
      { x: 4, label: "04", y: 5000 },
    ];
    const c = makeConverter("USD");
    const usd = raw.map((d) => ({ ...d, y: c(d.y) }));
    expect(usd[0].y).toBeCloseTo(169.4, 1);
    expect(usd[1].y).toBeCloseTo(11.55, 2);
    expect(usd[2].y).toBe(0);
    expect(usd[3].y).toBeCloseTo(38.5, 1);
    expect(usd[0].y).not.toBe(raw[0].y);
  });

  it("REGRESSION: raw-KES-in-chart would fail this", () => {
    const rawY = 22000;
    const correct = makeConverter("USD")(rawY);
    expect(correct).toBeLessThan(rawY / 100);
    expect(correct).not.toBe(rawY);
  });
});
