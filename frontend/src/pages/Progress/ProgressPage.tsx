import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchChildren, addMeasurement } from "@/store/slices/childrenSlice";
import { fetchAllProgress } from "@/store/slices/progressSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Avatar,
  Card,
  Spinner,
  EmptyState,
  Input,
  Button,
} from "@/components/ui";
import { AGE_GROUP_LABELS } from "@/types";
import type { ChildProgress } from "@/types";

export default function ProgressPage() {
  const dispatch = useAppDispatch();
  const children = useAppSelector((s) => s.children.items);
  const { items: progressItems, loading } = useAppSelector((s) => s.progress);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showAddMeasure, setShowAddMeasure] = useState(false);
  const [measureForm, setMeasureForm] = useState({
    heightCm: "",
    weightKg: "",
    note: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchChildren());
    dispatch(fetchAllProgress());
  }, []);

  const activeChild = children[activeIdx];
  const progress: ChildProgress | undefined = progressItems.find(
    (p) => p.child.id === activeChild?.id
  );

  const handleAddMeasurement = async () => {
    if (!activeChild) return;
    setSaving(true);
    await dispatch(
      addMeasurement({
        childId: activeChild.id,
        heightCm: measureForm.heightCm
          ? Number(measureForm.heightCm)
          : undefined,
        weightKg: measureForm.weightKg
          ? Number(measureForm.weightKg)
          : undefined,
        note: measureForm.note || undefined,
      })
    );
    setMeasureForm({ heightCm: "", weightKg: "", note: "" });
    setShowAddMeasure(false);
    setSaving(false);
    dispatch(fetchAllProgress());
  };

  // Prepare chart data from measurements
  const chartData = (progress?.measurements ?? []).map((m) => ({
    date: new Date(m.measuredAt).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    }),
    "Рост (см)": m.heightCm ?? undefined,
    "Вес (кг)": m.weightKg ?? undefined,
  }));

  // Prepare daily progress chart data (last 14 days)
  const taskChartData = (progress?.dailyProgress ?? []).slice(-14).map((d) => ({
    date: new Date(d.date).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
    }),
    "%": d.completionPct,
  }));

  return (
    <div>
      {/* Header */}
      <div
        className="relative px-5 pt-12 pb-6 rounded-b-[28px] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #fff, transparent)",
            transform: "translate(30%,-30%)",
          }}
        />

        <h1 className="text-white font-black text-2xl mb-5">⭐ Прогресс</h1>

        {/* Child tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveIdx(i)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl border-2 text-sm font-extrabold transition-all active:scale-95 ${
                activeIdx === i
                  ? "bg-white border-white text-[#f7971e]"
                  : "bg-white/20 border-white/40 text-white hover:bg-white/30"
              }`}
            >
              <Avatar name={c.name} color={c.avatarColor} size={22} />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5 pb-4 flex flex-col gap-4">
        {loading && (
          <div className="flex justify-center py-12">
            <Spinner size={36} />
          </div>
        )}
        {!loading && children.length === 0 && (
          <EmptyState
            emoji="👶"
            title="Нет детей"
            subtitle="Добавьте ребёнка на главной странице"
          />
        )}

        {activeChild && progress && (
          <>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              <StatCard
                emoji="✅"
                value={progress.completedEver}
                label="Выполнено"
                color="#e8f5e9"
              />
              <StatCard
                emoji="🔥"
                value={progress.streakDays}
                label="Дней подряд"
                color="#fff3e0"
              />
              <StatCard
                emoji="📊"
                value={
                  progress.totalEver > 0
                    ? `${Math.round(
                        (progress.completedEver / progress.totalEver) * 100
                      )}%`
                    : "0%"
                }
                label="Всего"
                color="#e3f2fd"
              />
            </div>

            {/* Task completion chart */}
            {taskChartData.length > 0 && (
              <Card className="p-4">
                <h3 className="font-black text-gray-800 mb-4">
                  📈 Выполнение заданий (14 дней)
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={taskChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      }}
                      formatter={(v: any) => [`${v}%`, "Выполнено"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="%"
                      stroke="#f7971e"
                      strokeWidth={2.5}
                      dot={{ fill: "#f7971e", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {/* Growth chart */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-800">📏 Рост и вес</h3>
                <button
                  onClick={() => setShowAddMeasure(!showAddMeasure)}
                  className="text-sm font-bold text-brand-purple bg-primary-50 px-3 py-1.5 rounded-xl hover:bg-primary-100 transition-all"
                >
                  + Добавить
                </button>
              </div>

              {showAddMeasure && (
                <div className="mb-4 p-4 bg-primary-50 rounded-2xl flex flex-col gap-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Рост (см)"
                      type="number"
                      placeholder="106"
                      value={measureForm.heightCm}
                      onChange={(e) =>
                        setMeasureForm((f) => ({
                          ...f,
                          heightCm: e.target.value,
                        }))
                      }
                    />
                    <Input
                      label="Вес (кг)"
                      type="number"
                      placeholder="16.8"
                      value={measureForm.weightKg}
                      onChange={(e) =>
                        setMeasureForm((f) => ({
                          ...f,
                          weightKg: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <Input
                    label="Заметка (необязательно)"
                    placeholder="Плановый осмотр"
                    value={measureForm.note}
                    onChange={(e) =>
                      setMeasureForm((f) => ({ ...f, note: e.target.value }))
                    }
                  />
                  <Button
                    onClick={handleAddMeasurement}
                    loading={saving}
                    size="sm"
                    fullWidth
                  >
                    Сохранить
                  </Button>
                </div>
              )}

              {chartData.length < 2 ? (
                <p className="text-gray-400 text-sm text-center py-6">
                  Добавьте минимум 2 измерения для отображения графика
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis
                      yAxisId="h"
                      orientation="left"
                      tick={{ fontSize: 10 }}
                      unit=" см"
                      domain={["auto", "auto"]}
                    />
                    <YAxis
                      yAxisId="w"
                      orientation="right"
                      tick={{ fontSize: 10 }}
                      unit=" кг"
                      domain={["auto", "auto"]}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      yAxisId="h"
                      type="monotone"
                      dataKey="Рост (см)"
                      stroke="#667eea"
                      strokeWidth={2.5}
                      dot={{ fill: "#667eea", r: 4 }}
                      connectNulls
                    />
                    <Line
                      yAxisId="w"
                      type="monotone"
                      dataKey="Вес (кг)"
                      stroke="#f7971e"
                      strokeWidth={2.5}
                      dot={{ fill: "#f7971e", r: 4 }}
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}

              {/* Measurement history list */}
              {chartData.length > 0 && (
                <div className="mt-4 border-t border-gray-100 pt-4">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    История
                  </p>
                  <div className="flex flex-col gap-2">
                    {[...progress.measurements]
                      .reverse()
                      .slice(0, 5)
                      .map((m, i) => (
                        <div
                          key={m.id ?? i}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-500 text-xs">
                            {new Date(m.measuredAt).toLocaleDateString(
                              "ru-RU",
                              { day: "numeric", month: "long", year: "numeric" }
                            )}
                          </span>
                          <span className="font-bold text-gray-700">
                            {m.heightCm && `📏 ${m.heightCm} см`}
                            {m.heightCm && m.weightKg && "  "}
                            {m.weightKg && `⚖️ ${m.weightKg} кг`}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({
  emoji,
  value,
  label,
  color,
}: {
  emoji: string;
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl p-4 text-center" style={{ background: color }}>
      <div className="text-2xl mb-1">{emoji}</div>
      <div className="font-black text-gray-800 text-xl">{value}</div>
      <div className="text-gray-500 text-[11px] font-semibold">{label}</div>
    </div>
  );
}
