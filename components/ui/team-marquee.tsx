"use client";

/**
 * WHOAI team marquee. Reuses the global `.wa-marquee-track` animation (defined
 * in globals.css) with a pause-on-hover wrapper. Portraits are Unsplash
 * placeholders — swap for real team photos/names before launch.
 */

type Member = { image: string; name: string; role: string };

const TEAM: Member[] = [
  { image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=480&q=80&auto=format&fit=crop", name: "Daniel Hayes", role: "Co-founder & CEO" },
  { image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=480&q=80&auto=format&fit=crop", name: "Aisha Rahman", role: "Co-founder & CTO" },
  { image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=480&q=80&auto=format&fit=crop", name: "Marcus Lee", role: "Head of Engineering" },
  { image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=480&q=80&auto=format&fit=crop", name: "Sofia Marenco", role: "Product Design Lead" },
  { image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=480&q=80&auto=format&fit=crop", name: "Ravi Desai", role: "Founding Engineer" },
  { image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=480&q=80&auto=format&fit=crop", name: "Hannah Brooks", role: "Head of Customer Success" },
];

function TeamCard({ member }: { member: Member }) {
  return (
    <div className="group flex w-60 shrink-0 flex-col px-3">
      <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-[#F1F5F9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={member.name}
          src={member.image}
          loading="lazy"
          className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 pt-10">
          <h3 className="text-[15px] font-bold text-white">{member.name}</h3>
          <p className="text-[12px] text-white/80">{member.role}</p>
        </div>
      </div>
    </div>
  );
}

export function TeamMarquee() {
  return (
    <section className="border-t border-[#EEE8E2] bg-white py-24">
      <div className="mx-auto mb-14 max-w-[640px] px-6 text-center">
        <span className="inline-block rounded-full border border-[#E6EBF1] bg-white px-4 py-1 text-[13px] font-semibold text-[#FF6B00] shadow-sm">
          The team
        </span>
        <h2 className="mt-5 text-[32px] font-bold tracking-[-0.02em] sm:text-[40px]">
          Built by people who&apos;ve felt the bill
        </h2>
        <p className="mt-4 text-[17px] leading-relaxed text-[#425466]">
          Engineers and operators who watched AI spend spiral — and decided to build the control plane
          we wished we&apos;d had.
        </p>
      </div>

      <div className="wa-marquee-pause relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="wa-marquee-track py-2">
          {[...TEAM, ...TEAM].map((m, i) => (
            <TeamCard key={`${m.name}-${i}`} member={m} />
          ))}
        </div>
      </div>
    </section>
  );
}
