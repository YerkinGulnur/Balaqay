import {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  forwardRef,
  ReactNode,
} from "react";
import { AVATAR_COLORS } from "@/types";

// ─── Button ───────────────────────────────────────────────────

type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
type BtnSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantClasses: Record<BtnVariant, string> = {
  primary:
    "bg-gradient-to-r from-brand-purple to-brand-violet text-white shadow-purple hover:opacity-90",
  secondary:
    "bg-white border-2 border-primary-100 text-primary-600 hover:bg-primary-50",
  ghost: "bg-transparent text-primary-600 hover:bg-primary-50",
  danger:
    "bg-gradient-to-r from-red-400 to-pink-500 text-white hover:opacity-90",
};

const sizeClasses: Record<BtnSize, string> = {
  sm: "px-4 py-2 text-sm rounded-2xl",
  md: "px-6 py-3.5 text-base rounded-2xl",
  lg: "px-8 py-4 text-base rounded-3xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading,
  fullWidth,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-bold transition-all duration-150
        active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]}
        ${fullWidth ? "w-full" : ""} ${className}
      `}
    >
      {loading && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

// ─── Input ────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-bold text-gray-600">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          {...props}
          className={`
            w-full px-4 py-3.5 rounded-2xl border-2 bg-white/80 text-gray-800
            font-nunito text-sm outline-none transition-all duration-200
            border-primary-100 focus:border-primary-600 placeholder:text-gray-400
            ${icon ? "pl-11" : ""}
            ${error ? "border-red-400 focus:border-red-400" : ""}
            ${className}
          `}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

// ─── Select ───────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({
  label,
  options,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-bold text-gray-600">{label}</label>
      )}
      <select
        {...props}
        className={`
          w-full px-4 py-3.5 rounded-2xl border-2 border-primary-100 bg-white/80
          text-gray-800 font-nunito text-sm outline-none transition-all duration-200
          focus:border-primary-600 ${className}
        `}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  color?: string;
  colorIndex?: number;
  size?: number;
  className?: string;
}

export function Avatar({
  name,
  color,
  colorIndex = 0,
  size = 48,
  className = "",
}: AvatarProps) {
  const bg = color ?? AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  const initials = name ? name.charAt(0).toUpperCase() : "?";
  const fontSize = Math.round(size * 0.38);

  return (
    <div
      style={{ width: size, height: size, background: bg, fontSize }}
      className={`rounded-full flex items-center justify-center font-black text-white
        border-[3px] border-white shadow-card flex-shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────

const badgeColors: Record<string, string> = {
  игровое: "bg-yellow-100 text-yellow-700",
  двигательное: "bg-green-100 text-green-700",
  речевое: "bg-blue-100 text-blue-700",
  когнитивное: "bg-purple-100 text-purple-700",
  задание: "bg-primary-100 text-primary-600",
  питание: "bg-orange-100 text-orange-700",
  развитие: "bg-teal-100 text-teal-700",
};

export function Badge({ label }: { label: string }) {
  return (
    <span
      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
        badgeColors[label] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {label}
    </span>
  );
}

// ─── Spinner ──────────────────────────────────────────────────

export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <svg
      style={{ width: size, height: size }}
      className="animate-spin text-primary-600"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
      />
    </svg>
  );
}

// ─── Card ─────────────────────────────────────────────────────

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white rounded-3xl shadow-card border border-primary-50 ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────

export function ProgressBar({
  value,
  max,
  color = "from-brand-purple to-brand-violet",
}: {
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="bg-primary-50 rounded-full h-2.5 overflow-hidden">
      <div
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────

export function EmptyState({
  emoji,
  title,
  subtitle,
}: {
  emoji: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4 animate-bounce-in">{emoji}</div>
      <h3 className="font-black text-gray-700 text-lg mb-1">{title}</h3>
      {subtitle && <p className="text-gray-400 text-sm max-w-xs">{subtitle}</p>}
    </div>
  );
}
