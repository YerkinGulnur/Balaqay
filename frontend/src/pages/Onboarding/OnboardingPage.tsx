import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store";
import { createChild } from "@/store/slices/childrenSlice";
import { Button, Input, Select, Avatar } from "@/components/ui";
import type { AgeGroup } from "@/types";
import { AGE_GROUP_LABELS, AVATAR_COLORS } from "@/types";

const AGE_OPTIONS = Object.entries(AGE_GROUP_LABELS).map(([v, l]) => ({
  value: v,
  label: l,
}));

interface ChildForm {
  name: string;
  ageGroup: AgeGroup;
  heightCm: string;
  weightKg: string;
  avatarColor: string;
}

const defaultForm = (i = 0): ChildForm => ({
  name: "",
  ageGroup: "1-3",
  heightCm: "",
  weightKg: "",
  avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
});

export default function OnboardingPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0=count, 1=child forms, 2=done
  const [childCount, setChildCount] = useState(1);
  const [forms, setForms] = useState<ChildForm[]>([defaultForm(0)]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleCountSelect = (n: number) => {
    setChildCount(n);
    setForms(Array.from({ length: n }, (_, i) => defaultForm(i)));
    setCurrentIdx(0);
    setStep(1);
  };

  const updateForm = (field: keyof ChildForm, val: string) => {
    setForms((prev) => {
      const next = [...prev];
      next[currentIdx] = { ...next[currentIdx], [field]: val };
      return next;
    });
  };

  const handleNext = () => {
    if (currentIdx < childCount - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      setStep(2);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      for (const f of forms) {
        if (f.name.trim()) {
          await dispatch(
            createChild({
              name: f.name,
              ageGroup: f.ageGroup,
              avatarColor: f.avatarColor,
              heightCm: f.heightCm ? Number(f.heightCm) : undefined,
              weightKg: f.weightKg ? Number(f.weightKg) : undefined,
            })
          );
        }
      }
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{
        background:
          "linear-gradient(160deg, #ffecd2 0%, #fcb69f 50%, #ff8c69 100%)",
      }}
    >
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #fff, transparent)",
          transform: "translate(30%, -30%)",
        }}
      />

      <div className="w-full max-w-sm animate-fade-up">
        {/* Step 0 — count */}
        {step === 0 && (
          <div className="bg-white/95 backdrop-blur-xl rounded-[28px] p-8 shadow-orange">
            <div className="text-center mb-8">
              <div className="text-5xl mb-3 animate-bounce-in">👶</div>
              <h2 className="text-2xl font-black text-gray-800">
                Сколько у вас детей?
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Вы сможете добавить ещё позже
              </p>
            </div>
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => handleCountSelect(n)}
                  className="w-full py-4 rounded-2xl font-extrabold text-lg text-[#7a3b0d] transition-all active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, #ffecd2, #fcb69f)",
                    boxShadow: "0 4px 16px rgba(252,182,159,0.4)",
                  }}
                >
                  {n === 3 ? "3 и более" : n} {n === 1 ? "ребёнок" : "ребёнка"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1 — child forms */}
        {step === 1 && (
          <div className="bg-white/95 backdrop-blur-xl rounded-[28px] p-8 shadow-orange">
            {/* Progress dots */}
            <div className="flex gap-2 justify-center mb-6">
              {Array.from({ length: childCount }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === currentIdx
                      ? "w-8 bg-brand-peach"
                      : i < currentIdx
                      ? "w-2 bg-brand-orange/60"
                      : "w-2 bg-gray-200"
                  }`}
                />
              ))}
            </div>

            <div className="text-center mb-6">
              <div className="text-4xl mb-2">📝</div>
              <h2 className="text-xl font-black text-gray-800">
                Ребёнок {currentIdx + 1} из {childCount}
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <Input
                label="Имя ребёнка"
                placeholder="Айя"
                value={forms[currentIdx].name}
                onChange={(e) => updateForm("name", e.target.value)}
              />
              <Select
                label="Возраст"
                value={forms[currentIdx].ageGroup}
                options={AGE_OPTIONS}
                onChange={(e) => updateForm("ageGroup", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Рост (см)"
                  type="number"
                  placeholder="105"
                  value={forms[currentIdx].heightCm}
                  onChange={(e) => updateForm("heightCm", e.target.value)}
                />
                <Input
                  label="Вес (кг)"
                  type="number"
                  placeholder="16"
                  value={forms[currentIdx].weightKg}
                  onChange={(e) => updateForm("weightKg", e.target.value)}
                />
              </div>

              {/* Avatar color */}
              <div>
                <p className="text-sm font-bold text-gray-600 mb-2">
                  Цвет аватара
                </p>
                <div className="flex gap-2 flex-wrap">
                  {AVATAR_COLORS.slice(0, 6).map((c) => (
                    <button
                      key={c}
                      onClick={() => updateForm("avatarColor", c)}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        forms[currentIdx].avatarColor === c
                          ? "scale-125 ring-2 ring-[#ff8c69] ring-offset-2"
                          : ""
                      }`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleNext}
                disabled={!forms[currentIdx].name.trim()}
                className="w-full py-4 rounded-2xl font-extrabold text-white text-lg disabled:opacity-50 transition-all active:scale-95 mt-2"
                style={{
                  background: "linear-gradient(135deg, #fcb69f, #ff8c69)",
                  boxShadow: "0 8px 24px rgba(252,182,159,0.5)",
                }}
              >
                {currentIdx < childCount - 1 ? "Следующий →" : "Готово ✓"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — done */}
        {step === 2 && (
          <div className="bg-white/95 backdrop-blur-xl rounded-[28px] p-8 shadow-orange text-center">
            <div className="text-7xl mb-4 animate-bounce-in">🎉</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">
              Всё готово!
            </h2>

            <div className="flex justify-center gap-3 my-6 flex-wrap">
              {forms
                .filter((f) => f.name)
                .map((f, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Avatar name={f.name} color={f.avatarColor} size={52} />
                    <span className="text-sm font-bold text-gray-700">
                      {f.name}
                    </span>
                  </div>
                ))}
            </div>

            <p className="text-gray-500 text-sm mb-6">
              Добавлено {forms.filter((f) => f.name).length}{" "}
              {forms.filter((f) => f.name).length === 1 ? "ребёнок" : "детей"}
            </p>

            <Button
              onClick={handleFinish}
              loading={loading}
              fullWidth
              size="lg"
              className="!bg-gradient-to-r !from-[#fcb69f] !to-[#ff8c69] !shadow-orange"
            >
              Начать 🚀
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
