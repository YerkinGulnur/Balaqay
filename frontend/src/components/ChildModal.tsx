import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  createChild,
  removeChild,
  updateChild,
} from "@/store/slices/childrenSlice";
import { Button, Input, Select, Avatar } from "@/components/ui";
import type { AgeGroup, Child } from "@/types";
import { AGE_GROUP_LABELS, AVATAR_COLORS } from "@/types";

interface Props {
  onClose: () => void;
}

const AGE_OPTIONS = Object.entries(AGE_GROUP_LABELS).map(([v, l]) => ({
  value: v,
  label: l,
}));

export function ChildModal({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const children = useAppSelector((s) => s.children.items);
  const [mode, setMode] = useState<"list" | "add" | "edit">("list");
  const [editTarget, setEditTarget] = useState<Child | null>(null);
  const [form, setForm] = useState({
    name: "",
    ageGroup: "1-3" as AgeGroup,
    heightCm: "",
    weightKg: "",
    avatarColor: AVATAR_COLORS[0],
  });
  const [loading, setLoading] = useState(false);

  const openAdd = () => {
    setForm({
      name: "",
      ageGroup: "1-3",
      heightCm: "",
      weightKg: "",
      avatarColor:
        AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    });
    setEditTarget(null);
    setMode("add");
  };

  const openEdit = (child: Child) => {
    setForm({
      name: child.name,
      ageGroup: child.ageGroup,
      heightCm: "",
      weightKg: "",
      avatarColor: child.avatarColor,
    });
    setEditTarget(child);
    setMode("edit");
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      if (mode === "add") {
        await dispatch(
          createChild({
            name: form.name,
            ageGroup: form.ageGroup,
            avatarColor: form.avatarColor,
            heightCm: form.heightCm ? Number(form.heightCm) : undefined,
            weightKg: form.weightKg ? Number(form.weightKg) : undefined,
          })
        );
      } else if (mode === "edit" && editTarget) {
        await dispatch(
          updateChild({
            id: editTarget.id,
            data: {
              name: form.name,
              ageGroup: form.ageGroup,
              avatarColor: form.avatarColor,
              heightCm: form.heightCm ? Number(form.heightCm) : undefined,
              weightKg: form.weightKg ? Number(form.weightKg) : undefined,
            },
          })
        );
      }
      setMode("list");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm("Удалить ребёнка?")) return;
    await dispatch(removeChild(id));
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-[28px] mb-[80px] w-full max-w-[430px] p-6 animate-slide-up max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {mode !== "list" && (
              <button
                onClick={() => setMode("list")}
                className="text-gray-500 hover:text-gray-800 text-xl"
              >
                ←
              </button>
            )}
            <h2 className="text-xl font-black text-gray-800">
              {mode === "list"
                ? "Дети"
                : mode === "add"
                ? "Добавить ребёнка"
                : "Редактировать"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* List mode */}
        {mode === "list" && (
          <>
            <div className="flex flex-col gap-3 mb-5">
              {children.map((child, i) => (
                <div
                  key={child.id}
                  className="flex items-center gap-3 p-3 bg-primary-50 rounded-2xl"
                >
                  <Avatar
                    name={child.name}
                    color={child.avatarColor}
                    size={44}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-800 truncate">
                      {child.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {AGE_GROUP_LABELS[child.ageGroup]}
                    </p>
                  </div>
                  <button
                    onClick={() => openEdit(child)}
                    className="text-primary-600 text-sm font-bold px-3 py-1.5 rounded-xl hover:bg-primary-100"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleRemove(child.id)}
                    className="text-red-400 text-sm font-bold px-3 py-1.5 rounded-xl hover:bg-red-50"
                  >
                    🗑️
                  </button>
                </div>
              ))}
              {children.length === 0 && (
                <p className="text-center text-gray-400 py-4">Детей пока нет</p>
              )}
            </div>
            <Button onClick={openAdd} fullWidth size="lg">
              + Добавить ребёнка
            </Button>
          </>
        )}

        {/* Add / Edit form */}
        {(mode === "add" || mode === "edit") && (
          <div className="flex flex-col gap-4">
            <Input
              label="Имя ребёнка"
              placeholder="Айя"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Select
              label="Возраст"
              value={form.ageGroup}
              options={AGE_OPTIONS}
              onChange={(e) =>
                setForm((f) => ({ ...f, ageGroup: e.target.value as AgeGroup }))
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Рост (см)"
                type="number"
                placeholder="105"
                value={form.heightCm}
                onChange={(e) =>
                  setForm((f) => ({ ...f, heightCm: e.target.value }))
                }
              />
              <Input
                label="Вес (кг)"
                type="number"
                placeholder="16"
                value={form.weightKg}
                onChange={(e) =>
                  setForm((f) => ({ ...f, weightKg: e.target.value }))
                }
              />
            </div>

            {/* Color picker */}
            <div>
              <p className="text-sm font-bold text-gray-600 mb-2">
                Цвет аватара
              </p>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setForm((f) => ({ ...f, avatarColor: c }))}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      form.avatarColor === c
                        ? "scale-125 ring-2 ring-primary-600 ring-offset-2"
                        : ""
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              loading={loading}
              fullWidth
              size="lg"
            >
              {mode === "add" ? "+ Добавить" : "✓ Сохранить"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
