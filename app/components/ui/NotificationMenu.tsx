import { Bell } from "lucide-react";

export default function NotificationMenu() {
  return (
    <button className="inline-flex h-11 w-11 items-center justify-center rounded-3xl border border-slate-200 bg-white text-slate-700 shadow-sm shadow-slate-200/30 transition hover:border-slate-300 hover:bg-slate-50">
      <Bell className="h-5 w-5" />
      <span className="sr-only">View notifications</span>
    </button>
  );
}
