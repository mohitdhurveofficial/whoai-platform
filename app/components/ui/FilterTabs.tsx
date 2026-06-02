type FilterTabsProps = {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
};

export function FilterTabs({ tabs, activeTab, onChange }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
            activeTab === tab
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
