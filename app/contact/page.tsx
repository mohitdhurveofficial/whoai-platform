import type { Metadata } from "next";
import { Mail, MessageSquare, Building2 } from "lucide-react";
import MarketingShell from "@/app/components/marketing/MarketingShell";
import LeadForm from "@/app/components/marketing/LeadForm";
import { Reveal, Stagger, StaggerItem } from "@/app/components/marketing/Motion";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the WHOAI team about sales, support, security, or partnerships.",
  alternates: { canonical: "/contact" },
};

const CHANNELS = [
  { icon: Mail, label: "Sales", value: "founders@whoai.ai", href: "mailto:founders@whoai.ai" },
  { icon: MessageSquare, label: "Support", value: "support@whoai.ai", href: "mailto:support@whoai.ai" },
  { icon: Building2, label: "Security", value: "security@whoai.ai", href: "mailto:security@whoai.ai" },
];

export default function ContactPage() {
  return (
    <MarketingShell>
      <section className="max-w-[1100px] mx-auto px-6 py-20 grid lg:grid-cols-2 gap-16 items-start">
        <div>
          <Reveal>
            <span className="inline-block text-[12px] font-semibold tracking-widest text-[#FF6B00] uppercase mb-4">
              Contact
            </span>
            <h1 className="text-[40px] md:text-[48px] leading-[1.1] font-extrabold tracking-tight mb-6">
              Talk to the team
            </h1>
            <p className="text-[18px] text-[#666666] mb-10 leading-relaxed">
              Questions about pricing, security, or whether WHOAI fits your stack? Send a note and a real
              person will reply within one business day.
            </p>
          </Reveal>
          <Stagger className="space-y-4" stagger={0.1}>
            {CHANNELS.map(({ icon: Icon, label, value, href }) => (
              <StaggerItem key={label}>
                <a
                  href={href}
                  className="flex items-center gap-4 rounded-lg border border-[#EEE8E2] bg-white px-5 py-4 hover:border-[#DCD5CD] transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[#888888] uppercase tracking-wide">{label}</p>
                    <p className="text-[15px] font-medium text-[#111111]">{value}</p>
                  </div>
                </a>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <Reveal x={30} delay={0.15} className="lg:pt-12">
          <LeadForm kind="CONTACT" />
        </Reveal>
      </section>
    </MarketingShell>
  );
}
