import { Newspaper, Sparkles, Globe, Bookmark } from 'lucide-react';

export default function Sidebar({ activeTab = 'all', onSelectTab }) {
  const menuItems = [
    { id: 'all', label: 'Feed', icon: Newspaper },
    { id: 'me', label: 'My Posts', icon: Sparkles },
    { id: 'community', label: 'Community', icon: Globe },
    { id: 'saved', label: 'Saved', icon: Bookmark },
  ];

  return (
    <aside className="w-full bg-white rounded-2xl border border-slate-200/70 p-3 shadow-2xs">
      <nav className="flex flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition text-left ${
                isActive
                  ? 'bg-blue-50 text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
