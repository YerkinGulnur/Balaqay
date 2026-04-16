import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchMe } from "@/store/slices/authSlice";
import { fetchChildren } from "@/store/slices/childrenSlice";

import AuthPage from "@/pages/Auth/AuthPage";
import OnboardingPage from "@/pages/Onboarding/OnboardingPage";
import HomePage from "@/pages/Home/HomePage";
import TasksPage from "@/pages/Tasks/TasksPage";
import TipsPage from "@/pages/Tips/TipsPage";
import ProgressPage from "@/pages/Progress/ProgressPage";
import { AppShell } from "@/components/layout/AppShell";
import { Spinner } from "@/components/ui";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { token, user } = useAppSelector((s) => s.auth);
  if (!token) return <Navigate to="/auth" replace />;
  return children;
}

function AppRoutes() {
  const dispatch = useAppDispatch();
  const { token, user, loading } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(fetchMe());
      dispatch(fetchChildren());
    }
  }, [token]);

  if (token && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f6ff]">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🌱</div>
          <Spinner size={32} />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/onboarding"
        element={
          <RequireAuth>
            <OnboardingPage />
          </RequireAuth>
        }
      />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AppShell>
              <Routes>
                <Route path="/home" element={<HomePage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/tips" element={<TipsPage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </AppShell>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
