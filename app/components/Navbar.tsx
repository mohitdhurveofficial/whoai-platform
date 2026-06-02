export default function Navbar() {
  return (
    <nav className="w-full border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="text-xl font-bold">
          WHOAI
        </div>

        <div className="flex gap-8">
          <a href="#">Platform</a>
          <a href="#">Solutions</a>
          <a href="#">Pricing</a>
          <a href="#">Docs</a>
        </div>

        <button className="px-5 py-2 rounded-lg bg-white text-black">
          Get Started
        </button>
      </div>
    </nav>
  );
}