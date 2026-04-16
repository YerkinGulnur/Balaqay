import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchChildren } from "@/store/slices/childrenSlice";
import {
  fetchAssignments,
  completeAssignment,
  uncompleteAssignment,
} from "@/store/slices/assignmentsSlice";
import { Avatar, Badge, Card, Spinner, EmptyState } from "@/components/ui";
import type { Assignment } from "@/types";

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const children = useAppSelector((s) => s.children.items);
  const { byChild, loading } = useAppSelector((s) => s.assignments);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    dispatch(fetchChildren());
  }, []);

  useEffect(() => {
    if (children[activeIdx]) {
      dispatch(fetchAssignments({ childId: children[activeIdx].id }));
    }
  }, [activeIdx, children]);

  const activeChild = children[activeIdx];
  const rawList = activeChild ? byChild[activeChild.id] ?? [] : [];

  // Group: today first, then older unread
  const today = new Date().toISOString().split("T")[0];
  const todayTasks = rawList.filter((a) => a.assignedDate === today);
  const pastUnread = rawList
    .filter((a) => a.assignedDate !== today && !a.isCompleted)
    .sort((a, b) => b.assignedDate.localeCompare(a.assignedDate));

  const toggle = async (a: Assignment) => {
    if (!activeChild) return;
    if (a.isCompleted) {
      dispatch(
        uncompleteAssignment({ childId: activeChild.id, assignmentId: a.id })
      );
    } else {
      dispatch(
        completeAssignment({ childId: activeChild.id, assignmentId: a.id })
      );
    }
  };

  const isLoading = activeChild ? loading[activeChild.id] : false;

  return (
    <div>
      {/* Header */}
      <div
        className="relative px-5 pt-12 pb-6 rounded-b-[28px] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #fff, transparent)",
            transform: "translate(30%,-30%)",
          }}
        />

        <h1 className="text-white font-black text-2xl mb-5">✉️ Задания</h1>

        {/* Child tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {children.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveIdx(i)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-2xl border-2 transition-all font-extrabold text-sm active:scale-95 ${
                activeIdx === i
                  ? "bg-white text-[#f5576c] border-white"
                  : "bg-white/15 text-white border-white/40 hover:bg-white/25"
              }`}
            >
              <Avatar name={c.name} color={c.avatarColor} size={22} />
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5 pb-4">
        {/* Day label */}
        {activeChild && (
          <div className="flex items-center gap-3 mb-5 p-4 bg-white rounded-2xl shadow-card border border-pink-100">
            <div className="text-2xl">📅</div>
            <div>
              <p className="text-xs text-gray-500 font-semibold">Сегодня</p>
              <p className="font-black text-gray-800">
                {new Date().toLocaleDateString("ru-RU", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner size={36} />
          </div>
        )}

        {!isLoading && children.length === 0 && (
          <EmptyState
            emoji="👶"
            title="Нет детей"
            subtitle="Добавьте ребёнка на главной странице"
          />
        )}

        {!isLoading &&
          activeChild &&
          todayTasks.length === 0 &&
          pastUnread.length === 0 && (
            <EmptyState
              emoji="🎉"
              title="Всё готово!"
              subtitle="Задания появятся завтра утром"
            />
          )}

        {/* Today's tasks */}
        {!isLoading && todayTasks.length > 0 && (
          <>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              Сегодня
            </p>
            <div className="flex flex-col gap-3 mb-6">
              {todayTasks.map((a) => (
                <TaskCard
                  key={a.id}
                  assignment={a}
                  onToggle={() => toggle(a)}
                />
              ))}
            </div>
          </>
        )}

        {/* Past unread */}
        {!isLoading && pastUnread.length > 0 && (
          <>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
              Непрочитанные задания
            </p>
            <div className="flex flex-col gap-3">
              {pastUnread.map((a) => (
                <TaskCard
                  key={a.id}
                  assignment={a}
                  onToggle={() => toggle(a)}
                  isPast
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TaskCard({
  assignment: a,
  onToggle,
  isPast,
}: {
  assignment: Assignment;
  onToggle: () => void;
  isPast?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-2xl p-4 flex items-start gap-4 shadow-card transition-all border-2 ${
        a.isCompleted
          ? "border-green-200 bg-green-50/50"
          : isPast
          ? "border-orange-200"
          : "border-primary-50"
      }`}
    >
      <div
        className={`text-3xl flex-shrink-0 mt-0.5 transition-all ${
          a.isCompleted ? "grayscale opacity-60" : ""
        }`}
      >
        {a.task.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`font-bold text-sm leading-snug ${
              a.isCompleted ? "line-through text-gray-400" : "text-gray-800"
            }`}
          >
            {a.task.title}
          </p>
          {isPast && !a.isCompleted && (
            <span className="flex-shrink-0 text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
              {new Date(a.assignedDate).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "short",
              })}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          {a.task.description}
        </p>
        <div className="mt-2">
          <Badge label={a.task.type} />
        </div>
      </div>

      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all active:scale-90 ${
          a.isCompleted
            ? "bg-green-400 border-green-400 text-white"
            : "border-gray-300 hover:border-green-400 hover:bg-green-50"
        }`}
      >
        {a.isCompleted && (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
