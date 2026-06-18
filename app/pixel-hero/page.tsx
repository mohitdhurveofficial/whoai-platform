// Isolated preview of the WHOAI pixel-canvas hero — view at /pixel-hero.
// The same component is now used as the homepage hero in app/page.tsx.

import type { Metadata } from "next";
import { PixelHero } from "@/components/ui/pixel-perfect-hero";

// Internal preview route — keep it out of search indexes.
export const metadata: Metadata = {
  title: "Hero preview",
  robots: { index: false, follow: false },
};

export default function PixelHeroDemoPage() {
  return <PixelHero />;
}
