import React, { InputHTMLAttributes, ReactNode } from "react";
import { Loader2, Phone, type LucideIcon } from "lucide-react";
import { GRID } from "./constants";
import type { Option, SectionTheme } from "./types";

/* ---------- class helpers ---------- */
export const inputClass = (
  theme: SectionTheme,
  viewMode: boolean,
  hasError = false,
  extra = "py-2.5 pr-3 text-sm",
) =>
  `w-full pl-10 text-gray-800 border rounded-lg outline-none transition placeholder:text-gray-400 disabled:cursor-not-allowed ${
    hasError
      ? "border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200"
      : `${theme.field} ${viewMode ? "bg-white/60" : "bg-white"}`
  } ${extra}`;

const wrapClass = (theme: SectionTheme, hasError: boolean) =>
  `relative flex items-center overflow-hidden text-sm border rounded-lg transition ${
    hasError ? "border-red-500 bg-red-50" : `${theme.wrap} bg-white`
  }`;

/* ---------- Section card ---------- */
export const Section: React.FC<{
  theme: SectionTheme;
  Icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ theme, Icon, title, action, children }) => (
  <div className={`p-5 border-2 rounded-xl ${theme.section}`}>
    <div
      className={`flex flex-col gap-4 pb-3 mb-5 border-b lg:flex-row lg:items-center lg:justify-between ${theme.heading}`}
    >
      <h3 className="flex items-center gap-3 text-lg font-semibold">
        <span
          className={`flex items-center justify-center text-white rounded-lg w-9 h-9 ${theme.badge}`}
        >
          <Icon size={20} />
        </span>
        {title}
      </h3>
      {action}
    </div>
    <div className={GRID}>{children}</div>
  </div>
);

/* ---------- Label + icon + error wrapper ---------- */
interface BaseProps {
  label: string;
  theme: SectionTheme;
  viewMode: boolean;
  Icon?: LucideIcon;
  iconAlign?: "center" | "top";
  required?: boolean;
  error?: string;
  wrapperClassName?: string;
}

const Field: React.FC<
  Omit<BaseProps, "viewMode"> & { children: React.ReactNode }
> = ({
  label,
  theme,
  Icon,
  iconAlign = "center",
  required,
  error,
  wrapperClassName = "",
  children,
}) => (
  <div className={wrapperClassName}>
    <label className="block mb-1.5 text-sm font-semibold text-slate-800">
      {label}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          className={`absolute z-10 pointer-events-none left-3 ${
            iconAlign === "top" ? "top-3" : "-translate-y-1/2 top-1/2"
          } ${theme.icon}`}
          size={18}
        />
      )}
      {children}
    </div>
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

/* ---------- Inputs ---------- */
export const TextField: React.FC<
  BaseProps & React.InputHTMLAttributes<HTMLInputElement>
> = ({
  label,
  theme,
  viewMode,
  Icon,
  required,
  error,
  wrapperClassName,
  ...props
}) => (
  <Field
    label={label}
    theme={theme}
    Icon={Icon}
    required={required}
    error={error}
    wrapperClassName={wrapperClassName}
  >
    <input
      {...props}
      disabled={viewMode}
      className={inputClass(theme, viewMode, !!error)}
    />
  </Field>
);

export const TextAreaField: React.FC<
  BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>
> = ({
  label,
  theme,
  viewMode,
  Icon,
  required,
  error,
  wrapperClassName,
  ...props
}) => (
  <Field
    label={label}
    theme={theme}
    Icon={Icon}
    iconAlign="top"
    required={required}
    error={error}
    wrapperClassName={wrapperClassName}
  >
    <textarea
      {...props}
      disabled={viewMode}
      className={inputClass(theme, viewMode, !!error)}
    />
  </Field>
);

export const SelectField: React.FC<
  BaseProps &
    React.SelectHTMLAttributes<HTMLSelectElement> & {
      placeholder: string;
      options: (string | Option)[];
      loading?: boolean;
    }
> = ({
  label,
  theme,
  viewMode,
  Icon,
  required,
  error,
  wrapperClassName,
  placeholder,
  options,
  loading,
  disabled,
  ...props
}) => (
  <Field
    label={label}
    theme={theme}
    Icon={Icon}
    required={required}
    error={error}
    wrapperClassName={wrapperClassName}
  >
    <select
      {...props}
      disabled={viewMode || disabled}
      className={inputClass(theme, viewMode, !!error)}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => {
        const { value, label: text } =
          typeof o === "string" ? { value: o, label: o } : o;
        return (
          <option key={value} value={value}>
            {text}
          </option>
        );
      })}
    </select>
    {loading && (
      <Loader2
        className={`absolute w-4 h-4 right-8 top-3 animate-spin ${theme.icon}`}
      />
    )}
  </Field>
);

/* Phone: left me prefix (+91 ya country dropdown), right me phone icon */
/* Phone: left me prefix (+91 ya country dropdown), right me phone icon */
export const PhoneField: React.FC<
  Omit<BaseProps, "Icon" | "iconAlign"> &
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> & {
      prefix: React.ReactNode;
    }
> = ({
  label,
  theme,
  viewMode,
  required,
  error,
  wrapperClassName,
  prefix,
  ...props
}) => (
  <Field
    label={label}
    theme={theme}
    required={required}
    error={error}
    wrapperClassName={wrapperClassName}
  >
    <div className={wrapClass(theme, !!error)}>
      {prefix}
      <input
        {...props}
        disabled={viewMode}
        inputMode="numeric"
        className="w-full py-2.5 pl-3 pr-9 text-sm bg-transparent outline-none placeholder:text-gray-400"
      />
      <Phone
        size={18}
        className={`absolute -translate-y-1/2 pointer-events-none right-3 top-1/2 ${theme.icon}`}
      />
    </div>
  </Field>
);

export const FileField: React.FC<
  Pick<BaseProps, "label" | "theme" | "viewMode"> & {
    Icon: LucideIcon;
    file: File | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
> = ({ label, theme, viewMode, Icon, file, onChange }) => (
  <Field label={label} theme={theme} Icon={Icon}>
    <input
      type="file"
      onChange={onChange}
      disabled={viewMode}
      className={inputClass(
        theme,
        viewMode,
        false,
        "py-1.5 pr-3 text-xs file:mr-3 file:px-3 file:py-1 file:border-0 file:rounded-md file:bg-amber-100 file:text-amber-800 file:text-xs file:font-medium",
      )}
    />
    {file && (
      <p className="mt-1 text-xs text-gray-500 truncate">{file.name}</p>
    )}
  </Field>
);
