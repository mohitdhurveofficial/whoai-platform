import Link from "next/link";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Policies", href: "/policies" },
      { label: "Approvals", href: "/approvals" },
      { label: "Analytics", href: "/analytics" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "API Reference", href: "/docs" },
      { label: "Guides", href: "/docs" },
      { label: "Changelog", href: "/docs" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/" },
      { label: "Careers", href: "/" },
      { label: "Contact", href: "/" },
      { label: "Partners", href: "/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/" },
      { label: "Terms", href: "/" },
      { label: "Security", href: "/security" },
      { label: "Compliance", href: "/risks" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/8 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-[1120px]">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-black text-white">
                W
              </span>
              <span className="text-xl font-black tracking-tight">WhoAI</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-black/56">
              Runtime governance, approvals, risk controls, and audit trails
              for autonomous AI agents.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-black">{column.title}</h3>
                <div className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block text-sm font-medium text-black/52 transition hover:text-orange-700"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-black/8 pt-7 text-sm font-semibold text-black/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 WhoAI</p>
          <p>Built for teams shipping governed AI systems.</p>
        </div>
      </div>
    </footer>
  );
}
