import { UserCircle } from "lucide-react";

export default function UserMenu() {
  return (
    <button className="inline-flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm shadow-slate-200/30 transition hover:border-slate-300 hover:bg-slate-50">
      <UserCircle className="h-5 w-5 text-sky-600" />
      <div className="text-left">
        <p className="text-sm font-semibold text-slate-950">Morgan Lee</p>
        <p className="text-xs text-slate-500">Admin</p>
      </div>
    </button>
  );
}
