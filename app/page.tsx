import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Workflow from "@/components/landing/Workflow";
import DashboardPreview from "@/components/landing/DashboardPreview";
import TrustedBy from "@/components/landing/TrustedBy";
import Features from "@/components/landing/Features";
import Metrics from "@/components/landing/Metrics";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import { Bot, Fingerprint, LockKeyhole, ShieldCheck } from "lucide-react";

export default function HomePage() {
  return (
    <main className="texture min-h-screen overflow-hidden">
      <Navbar />

      <section className="relative mx-auto grid w-full max-w-[1200px] items-center gap-10 px-4 pb-8 pt-20 sm:px-6 md:pt-24 lg:grid-cols-[1fr_0.86fr] lg:pb-10">
        <div className="hero-shield hidden lg:block" />
        <div className="dot-field absolute right-8 top-20 hidden h-64 w-56 opacity-30 lg:block" />
        <div className="dot-field absolute bottom-10 right-[-30px] hidden h-40 w-52 opacity-35 lg:block" />

        <div className="absolute left-6 top-36 hidden h-[310px] w-[92px] rounded-l-full border-l-2 border-dashed border-black/10 lg:block" />
        <div className="absolute right-5 top-36 hidden h-[390px] w-[260px] rounded-r-full border-r-2 border-dashed border-black/10 lg:block" />

        <div className="absolute left-2 top-[150px] hidden h-16 w-16 items-center justify-center rounded-full bg-white text-orange-500 shadow-premium lg:flex">
          <Bot size={30} />
        </div>
        <div className="absolute left-2 bottom-[54px] hidden h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-premium lg:flex">
          <ShieldCheck size={27} />
        </div>
        <div className="absolute right-4 top-[146px] hidden h-16 w-16 items-center justify-center rounded-full bg-white text-violet-600 shadow-premium lg:flex">
          <Fingerprint size={29} />
        </div>
        <div className="absolute right-[95px] bottom-[148px] hidden h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-500 shadow-premium lg:flex">
          <LockKeyhole size={28} />
        </div>

        <Hero />
        <Workflow />
      </section>

      <DashboardPreview />
      <TrustedBy />
      <Features />
      <Metrics />
      <CTA />
      <Footer />
    </main>
  );
}
