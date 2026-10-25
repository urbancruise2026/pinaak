import React from "react";
import { Loader2, type LucideIcon } from "lucide-react";
import { GRID } from "./constants";
import type { SectionTheme } from "./types";

/* ---------- shared input class ---------- */
export const inputClass = (
  theme: SectionTheme,
  viewMode: boolean,
  extra = "py-2.5 pr-3 text-sm",
) =>
  `w-full pl-10 text-gray-800 border rounded-lg outline-none transition placeholder:text-gray-400 disabled:cursor-not-allowed ${theme.field} ${
    viewMode ? "bg-white/60" : "bg-white"
  } ${extra}`;

/* ---------- Section card ---------- */
export const Section: React.FC<{
  theme: SectionTheme;
  Icon: LucideIcon;
  title: string;
  children: React.ReactNode;
}> = ({ theme, Icon, title, children }) => (
  <div className={`p-5 border-2 rounded-xl ${theme.section}`}>
    <h3
      className={`flex items-center gap-3 pb-3 mb-5 text-lg font-semibold border-b ${theme.heading}`}
    >
      <span
        className={`flex items-center justify-center w-9 h-9 text-white rounded-lg ${theme.badge}`}
      >
        <Icon size={20} />
      </span>
      {title}
    </h3>
    <div className={GRID}>{children}</div>
  </div>
);

/* ---------- Label + left icon wrapper ---------- */
interface BaseProps {
  label: string;
  Icon: LucideIcon;
  theme: SectionTheme;
  viewMode: boolean;
}

const Field: React.FC<
  Pick<BaseProps, "label" | "Icon" | "theme"> & {
    children: React.ReactNode;
    footer?: React.ReactNode;
  }
> = ({ label, Icon, theme, children, footer }) => (
  <div>
    <label className="block mb-1.5 text-sm font-semibold text-slate-800">
      {label}
    </label>
    <div className="relative">
      <Icon
        className={`absolute z-10 -translate-y-1/2 pointer-events-none left-3 top-1/2 ${theme.icon}`}
        size={18}
      />
      {children}
    </div>
    {footer}
  </div>
);

/* ---------- Text input ---------- */
export const TextField: React.FC<
  BaseProps &
    React.InputHTMLAttributes<HTMLInputElement> & {
      suffix?: React.ReactNode;
      inputExtra?: string;
    }
> = ({ label, Icon, theme, viewMode, suffix, inputExtra, ...props }) => (
  <Field label={label} Icon={Icon} theme={theme}>
    <input
      {...props}
      disabled={viewMode}
      className={inputClass(theme, viewMode, inputExtra)}
    />
    {suffix}
  </Field>
);

/* ---------- Select ---------- */
export const SelectField: React.FC<
  BaseProps &
    React.SelectHTMLAttributes<HTMLSelectElement> & {
      placeholder: string;
      options: string[];
      loading?: boolean;
    }
> = ({
  label,
  Icon,
  theme,
  viewMode,
  placeholder,
  options,
  loading,
  disabled,
  ...props
}) => (
  <Field label={label} Icon={Icon} theme={theme}>
    <select
      {...props}
      disabled={viewMode || disabled}
      className={inputClass(theme, viewMode)}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
    {loading && (
      <Loader2
        className={`absolute w-4 h-4 right-8 top-3 animate-spin ${theme.icon}`}
      />
    )}
  </Field>
);

/* ---------- File input ---------- */
export const FileField: React.FC<
  BaseProps & {
    file: File | null;
    currentUrl?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
> = ({ label, Icon, theme, viewMode, file, currentUrl, onChange }) => (
  <Field
    label={label}
    Icon={Icon}
    theme={theme}
    footer={
      file ? (
        <p className="mt-1 text-xs text-gray-500 truncate">{file.name}</p>
      ) : currentUrl ? (
        <p className="mt-1 text-xs text-blue-500 truncate">
          Current:{" "}
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View file
          </a>
        </p>
      ) : null
    }
  >
    <input
      type="file"
      onChange={onChange}
      disabled={viewMode}
      className={inputClass(
        theme,
        viewMode,
        "py-1.5 pr-3 text-xs file:mr-3 file:px-3 file:py-1 file:border-0 file:rounded-md file:bg-amber-100 file:text-amber-800 file:text-xs file:font-medium",
      )}
    />
  </Field>
);
