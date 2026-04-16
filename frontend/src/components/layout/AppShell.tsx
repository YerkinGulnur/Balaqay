import { useLocation, useNavigate } from "react-router-dom";

const TABS = [
  { path: "/home", icon: "🏠", label: "Главная" },
  { path: "/tasks", icon: "✉️", label: "Задания" },
  { path: "/tips", icon: "📋", label: "Советы" },
  { path: "/progress", icon: "⭐", label: "Прогресс" },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      className="
      fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px]
      bg-white/95 backdrop-blur-xl border-t border-primary-100
      flex z-50 shadow-[0_-8px_32px_rgba(102,126,234,0.10)]
    "
    >
      {TABS.map(({ path, icon, label }) => {
        const active = pathname.startsWith(path);
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-all duration-150 active:scale-95"
          >
            <span
              className={`text-2xl transition-all duration-200 ${
                active ? "" : "grayscale opacity-50"
              }`}
            >
              {icon}
            </span>
            <span
              className={`text-[11px] font-extrabold transition-colors duration-200 ${
                active ? "text-brand-purple" : "text-gray-400"
              }`}
            >
              {label}
            </span>
            {active && (
              <span className="absolute bottom-0 w-6 h-0.5 bg-gradient-to-r from-brand-purple to-brand-violet rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}

// ─── App Shell ────────────────────────────────────────────────

import { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative max-w-[430px] mx-auto min-h-screen bg-[#f8f6ff] flex flex-col">
      <main className="flex-1 overflow-y-auto pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
