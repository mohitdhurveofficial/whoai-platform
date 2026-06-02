import Link from "next/link";
import { Gamepad2, GitFork, X } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Agents", href: "/agents" },
  { label: "Policies", href: "/policies" },
  { label: "Docs", href: "/docs" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 px-6 py-7">
      <div className="mx-auto flex max-w-[1390px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="shield-logo h-12 w-10 bg-[#071126]" />
          <span className="text-[32px] font-black leading-none tracking-[-0.04em] text-[#071126]">
            WhoAI
          </span>
        </Link>

        <nav className="glass shadow-premium absolute left-1/2 top-6 hidden h-[68px] -translate-x-1/2 items-center gap-10 rounded-full border border-white/80 px-14 text-[15px] font-semibold text-[#071126] lg:flex">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center gap-1.5 transition hover:text-orange-600">
              {item.label}
            </Link>
          ))}
          <span className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 border-b border-r border-white/80 bg-white/82" />
        </nav>

        <div className="flex items-center gap-5">
          <div className="hidden items-center gap-6 text-[#071126] md:flex">
            <Link
              href="https://github.com"
              aria-label="Github"
              className="transition hover:text-orange-600"
            >
              <GitFork size={22} strokeWidth={2.8} />
            </Link>
            <Link
              href="https://x.com"
              aria-label="X"
              className="transition hover:text-orange-600"
            >
              <X size={22} strokeWidth={2.8} />
            </Link>
            <Link
              href="https://discord.com"
              aria-label="Discord"
              className="transition hover:text-orange-600"
            >
              <Gamepad2 size={24} strokeWidth={2.8} />
            </Link>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-[56px] items-center gap-3 rounded-full bg-[#071126] px-7 text-[15px] font-bold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5"
          >
            Dashboard
            <span className="text-2xl leading-none text-orange-500">→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
