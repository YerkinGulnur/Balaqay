import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchChildren } from "@/store/slices/childrenSlice";
import { fetchAssignments } from "@/store/slices/assignmentsSlice";
import {
  Avatar,
  Card,
  ProgressBar,
  Spinner,
  EmptyState,
} from "@/components/ui";
import { ChildModal } from "@/components/ChildModal";
import { AGE_GROUP_LABELS } from "@/types";

export default function HomePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const { items: children, loading } = useAppSelector((s) => s.children);
  const assignments = useAppSelector((s) => s.assignments.byChild);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchChildren());
  }, []);

  useEffect(() => {
    children.forEach((c) => {
      if (!assignments[c.id]) dispatch(fetchAssignments({ childId: c.id }));
    });
  }, [children]);

  const getProgress = (childId: string) => {
    const list = assignments[childId] ?? [];
    const today = new Date().toISOString().split("T")[0];
    const todayTasks = list.filter((a) => a.assignedDate === today);
    const done = todayTasks.filter((a) => a.isCompleted).length;
    return { done, total: todayTasks.length };
  };

  return (
    <div className="flex flex-col">
      {/* Header gradient */}
      <div
        className="relative px-5 pt-12 pb-8 rounded-b-[32px] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        {/* Decoration */}
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #fff, transparent)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #ffd200, transparent)",
            transform: "translate(-40%, 40%)",
          }}
        />

        {/* Top row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-white/70 text-sm font-semibold">
              Привет, {user?.name?.split(" ")[0]} 👋
            </p>
            <h1 className="text-white text-2xl font-black mt-0.5">Balaqay</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-white/20 border border-white/30 text-white text-sm font-bold px-4 py-2 rounded-2xl backdrop-blur-sm hover:bg-white/30 transition-all active:scale-95"
          >
            + Дети
          </button>
        </div>

        {/* Children cards */}
        {loading ? (
          <div className="flex justify-center py-4">
            <Spinner size={32} />
          </div>
        ) : children.length === 0 ? (
          <div className="text-center text-white/70 py-4">
            <p className="font-semibold">Добавьте первого ребёнка →</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
            {children.map((child, i) => {
              const { done, total } = getProgress(child.id);
              return (
                <div
                  key={child.id}
                  onClick={() => navigate("/tasks")}
                  className="flex-shrink-0 w-40 rounded-[20px] p-4 cursor-pointer active:scale-95 transition-all"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Avatar
                    name={child.name}
                    color={child.avatarColor}
                    size={48}
                  />
                  <p className="text-white font-black text-base mt-3 truncate">
                    {child.name}
                  </p>
                  <p className="text-white/70 text-xs">
                    {AGE_GROUP_LABELS[child.ageGroup]}
                  </p>

                  {/* Latest measurement */}
                  {child.measurements &&
                    child.measurements.length > 0 &&
                    (() => {
                      const latest =
                        child.measurements[child.measurements.length - 1];
                      return (
                        <p className="text-white/60 text-[10px] mt-1">
                          {latest.heightCm && `📏 ${latest.heightCm} см`}
                          {latest.heightCm && latest.weightKg && " · "}
                          {latest.weightKg && `⚖️ ${latest.weightKg} кг`}
                        </p>
                      );
                    })()}

                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#ffd200] transition-all duration-700"
                        style={{
                          width:
                            total > 0
                              ? `${Math.round((done / total) * 100)}%`
                              : "0%",
                        }}
                      />
                    </div>
                    <p className="text-white/60 text-[10px] mt-1">
                      {done}/{total} заданий
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Today's quick tasks */}
      <div className="px-5 pt-6">
        <h2 className="text-lg font-black text-gray-800 mb-4">
          Задания на сегодня
        </h2>

        {children.length === 0 && !loading && (
          <EmptyState
            emoji="👶"
            title="Нет детей"
            subtitle="Добавьте ребёнка, чтобы получать ежедневные задания"
          />
        )}

        {children.map((child, i) => {
          const today = new Date().toISOString().split("T")[0];
          const todayTasks = (assignments[child.id] ?? [])
            .filter((a) => a.assignedDate === today)
            .slice(0, 2);
          if (todayTasks.length === 0) return null;

          return (
            <div key={child.id} className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Avatar name={child.name} color={child.avatarColor} size={28} />
                <span className="font-black text-gray-700 text-sm">
                  {child.name}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {todayTasks.map((a) => (
                  <Card key={a.id} className="p-4 flex items-center gap-3">
                    <span className="text-2xl flex-shrink-0">
                      {a.task.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">
                        {a.task.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {a.task.description.slice(0, 60)}…
                      </p>
                    </div>
                    {a.isCompleted && (
                      <span className="text-green-500 text-lg flex-shrink-0">
                        ✓
                      </span>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && <ChildModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
