import type { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  tone?: "navy" | "orange" | "green" | "red";
};

const tones = {
  navy: "bg-slate-950 text-white",
  orange: "bg-orange-50 text-orange-700",
  green: "bg-emerald-50 text-emerald-700",
  red: "bg-red-50 text-red-700",
};

export default function StatCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "navy",
}: Props) {
  return (
    <article className="rounded-[24px] border border-black/5 bg-white/82 p-6 shadow-[0_18px_50px_rgba(7,17,38,0.055)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">
            {value}
          </h3>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon size={22} />
        </div>
      </div>
      <p className="mt-5 text-sm font-medium text-slate-500">{detail}</p>
    </article>
  );
}
