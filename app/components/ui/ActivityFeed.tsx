import type { LucideIcon } from "lucide-react";

type ActivityFeedItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  outcome: string;
  icon: LucideIcon;
};

type ActivityFeedProps = {
  items: ActivityFeedItem[];
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Activity feed</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">Recent governance events</h3>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="flex items-start gap-4 rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-3xl bg-white text-slate-700 shadow-sm shadow-slate-200/40">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </div>
              <div className="text-right text-xs text-slate-500">
                <p>{item.outcome}</p>
                <p className="mt-2">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
