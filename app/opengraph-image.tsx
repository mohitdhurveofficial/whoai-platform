import { ImageResponse } from "next/og";

// Open Graph image metadata (file convention — auto-applied to og:image and
// twitter:image since metadata.twitter.card is "summary_large_image").
export const alt =
  "WHOAI — Stop runaway AI spend. Track tokens, enforce budgets.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Branded 1200x630 card. Uses default sans-serif (no external font file) to
// keep image generation build-safe.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "100px",
          backgroundColor: "#111111",
        }}
      >
        <div
          style={{
            fontSize: 160,
            fontWeight: 800,
            letterSpacing: "-0.04em",
            color: "#FF6B00",
            lineHeight: 1,
          }}
        >
          WHOAI
        </div>
        <div
          style={{
            marginTop: 40,
            fontSize: 56,
            fontWeight: 700,
            color: "#FAF7F3",
            lineHeight: 1.15,
          }}
        >
          Stop runaway AI spend.
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 44,
            fontWeight: 500,
            color: "#999999",
            lineHeight: 1.2,
          }}
        >
          Track tokens, enforce budgets.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
