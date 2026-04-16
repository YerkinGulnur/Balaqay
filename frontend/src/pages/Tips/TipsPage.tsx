import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchTasks } from "@/store/slices/tasksSlice";
import { Spinner } from "@/components/ui";
import type { AgeGroup, TaskSection } from "@/types";
import { AGE_GROUP_LABELS } from "@/types";

const SECTION_TABS: { key: TaskSection; label: string; emoji: string }[] = [
  { key: "развитие", label: "Развитие", emoji: "🧠" },
  { key: "питание", label: "Питание", emoji: "🥗" },
];

const SECTION_COLORS: Record<string, string> = {
  развитие: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  питание: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
};

const CARD_BG: Record<string, string[]> = {
  развитие: [
    "#e3f2fd",
    "#f3e5f5",
    "#e8f5e9",
    "#fff9c4",
    "#ffe4e1",
    "#fff3e0",
    "#fce4ec",
    "#e8eaf6",
  ],
  питание: [
    "#fff3e0",
    "#e8f5e9",
    "#fce4ec",
    "#e3f2fd",
    "#f3e5f5",
    "#fff9c4",
    "#e8eaf6",
    "#ffe4e1",
  ],
};

export default function TipsPage() {
  const dispatch = useAppDispatch();
  const { items: tasks, loading } = useAppSelector((s) => s.tasks);
  const [section, setSection] = useState<TaskSection>("развитие");
  const [ageFilter, setAgeFilter] = useState<AgeGroup | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchTasks({ section }));
  }, [section]);

  const filtered = tasks.filter(
    (t) =>
      t.section === section && (ageFilter === "all" || t.ageGroup === ageFilter)
  );

  return (
    <div>
      {/* Header */}
      <div
        className="relative px-5 pt-12 pb-6 rounded-b-[28px] overflow-hidden"
        style={{ background: SECTION_COLORS[section] }}
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #fff, transparent)",
            transform: "translate(30%,-30%)",
          }}
        />

        <h1 className="text-white font-black text-2xl mb-5">📋 Советы</h1>

        {/* Section tabs */}
        <div className="flex bg-white/20 rounded-2xl p-1 mb-5">
          {SECTION_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setSection(tab.key);
                setExpanded(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-extrabold transition-all ${
                section === tab.key
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-white hover:bg-white/20"
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* Age filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterChip
            label="Все"
            active={ageFilter === "all"}
            onClick={() => setAgeFilter("all")}
          />
          {(Object.entries(AGE_GROUP_LABELS) as [AgeGroup, string][]).map(
            ([k, v]) => (
              <FilterChip
                key={k}
                label={v}
                active={ageFilter === k}
                onClick={() => setAgeFilter(k)}
              />
            )
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5 pb-4">
        {loading && (
          <div className="flex justify-center py-12">
            <Spinner size={36} />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🔍</p>
            <p className="font-bold">Ничего не найдено</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {filtered.map((task, i) => {
            const bg = CARD_BG[section][i % CARD_BG[section].length];
            const isOpen = expanded === task.id;
            return (
              <div
                key={task.id}
                onClick={() => setExpanded(isOpen ? null : task.id)}
                className="rounded-2xl p-4 cursor-pointer transition-all active:scale-[0.98]"
                style={{ background: bg, border: "1px solid rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl flex-shrink-0">{task.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-800 text-sm leading-snug">
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {AGE_GROUP_LABELS[task.ageGroup]}
                    </p>
                  </div>
                  <span
                    className={`text-gray-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>
                {isOpen && (
                  <p className="text-sm text-gray-700 mt-3 leading-relaxed animate-fade-in border-t border-black/5 pt-3">
                    {task.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-4 py-2 rounded-2xl border-2 text-xs font-extrabold transition-all active:scale-95 ${
        active
          ? "bg-white border-white text-gray-800"
          : "bg-white/20 border-white/40 text-white hover:bg-white/30"
      }`}
    >
      {label}
    </button>
  );
}
