import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { register, login, clearError } from "@/store/slices/authSlice";
import { Button, Input } from "@/components/ui";
import { fetchChildren } from "@/store/slices/childrenSlice";

export default function AuthPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector((s) => s.auth);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", name: "", password: "" });

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch(clearError());
      setForm((f) => ({ ...f, [k]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let result;
    if (mode === "register") {
      result = await dispatch(
        register({
          email: form.email,
          name: form.name,
          password: form.password,
        })
      );
    } else {
      result = await dispatch(
        login({ email: form.email, password: form.password })
      );
    }
    if (result.meta.requestStatus === "fulfilled") {
      const childrenResult = await dispatch(fetchChildren());
      const children = childrenResult.payload as any[];
      
      if (children.length > 0) {
        navigate("/home");      // уже есть дети → сразу на главную
      } else {
        navigate("/onboarding"); // новый пользователь → онбординг
      }
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center p-5"
      style={{
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-[-10%] right-[-10%] w-72 h-72 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #fff, transparent)" }}
      />
      <div
        className="absolute bottom-[-5%] left-[-10%] w-80 h-80 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #ffd200, transparent)" }}
      />

      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3 animate-bounce-in">🌱</div>
          <h1 className="text-white font-black text-4xl tracking-tight">
            Balaqay
          </h1>
          <p className="text-white/70 mt-1 font-semibold">
            Растите вместе с ребёнком
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[28px] p-8 shadow-purple">
          {/* Tab switch */}
          <div className="flex bg-primary-50 rounded-2xl p-1 mb-6">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  dispatch(clearError());
                }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-200 ${
                  mode === m
                    ? "bg-brand-purple text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {m === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <Input
                label="Ваше имя"
                placeholder="Лейла"
                value={form.name}
                onChange={set("name")}
                required
              />
            )}
            <Input
              label="Эл. почта"
              type="email"
              placeholder="parent@example.com"
              value={form.email}
              onChange={set("email")}
              required
            />
            <Input
              label="Пароль"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={set("password")}
              required
              minLength={6}
            />

            {error && (
              <p className="text-red-500 text-sm font-semibold text-center animate-fade-in bg-red-50 py-2 rounded-xl">
                {error}
              </p>
            )}

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              className="mt-2"
            >
              {mode === "login" ? "Войти →" : "Создать аккаунт →"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
