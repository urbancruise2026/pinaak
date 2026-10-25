"use client";

import React from "react";
import type { LucideIcon } from "lucide-react";

export interface Theme {
  border: string;
  header: string;
  iconBox: string;
  title: string;
  icon: string;
  focus: string;
  button: string;
}

/* ------------------------------ Section ------------------------------ */

interface SectionProps {
  theme: Theme;
  Icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  gridClassName?: string;
}

export function Section({
  theme,
  Icon,
  title,
  action,
  children,
  gridClassName = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
}: SectionProps) {
  return (
    <section
      className={`overflow-hidden rounded-xl border bg-white ${theme.border}`}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${theme.header}`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${theme.iconBox}`}
          >
            <Icon size={19} />
          </span>
          <h3 className={`text-base font-semibold ${theme.title}`}>{title}</h3>
        </div>
        {action}
      </div>

      <div className={`p-4 ${gridClassName}`}>{children}</div>
    </section>
  );
}

/* ------------------------------ Field shell ------------------------------ */

interface FieldShellProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  wrapperClassName?: string;
  children: React.ReactNode;
}

function FieldShell({
  label,
  htmlFor,
  required,
  wrapperClassName = "",
  children,
}: FieldShellProps) {
  return (
    <div className={wrapperClassName}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT_BASE =
  "w-full rounded-lg border border-gray-300 bg-white py-2.5 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 disabled:bg-gray-50 disabled:text-gray-500";

/* ------------------------------ TextField ------------------------------ */

interface TextFieldProps {
  label: string;
  name: string;
  value?: string | number;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  Icon?: LucideIcon;
  theme: Theme;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  max?: string;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  wrapperClassName?: string;
}

export function TextField({
  label,
  name,
  value,
  onChange,
  Icon,
  theme,
  type = "text",
  placeholder,
  required,
  min,
  max,
  maxLength,
  inputMode,
  wrapperClassName,
}: TextFieldProps) {
  return (
    <FieldShell
      label={label}
      htmlFor={name}
      required={required}
      wrapperClassName={wrapperClassName}
    >
      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${theme.icon}`}
          />
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          max={max}
          maxLength={maxLength}
          inputMode={inputMode}
          className={`${INPUT_BASE} ${Icon ? "pl-10" : "pl-3.5"} ${theme.focus}`}
        />
      </div>
    </FieldShell>
  );
}

/* ------------------------------ TextAreaField ------------------------------ */

interface TextAreaFieldProps {
  label: string;
  name: string;
  value?: string;
  onChange: TextFieldProps["onChange"];
  Icon?: LucideIcon;
  theme: Theme;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  wrapperClassName?: string;
}

export function TextAreaField({
  label,
  name,
  value,
  onChange,
  Icon,
  theme,
  placeholder,
  rows = 3,
  required,
  wrapperClassName,
}: TextAreaFieldProps) {
  return (
    <FieldShell
      label={label}
      htmlFor={name}
      required={required}
      wrapperClassName={wrapperClassName}
    >
      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className={`pointer-events-none absolute left-3 top-3 ${theme.icon}`}
          />
        )}
        <textarea
          id={name}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
          className={`${INPUT_BASE} resize-y ${Icon ? "pl-10" : "pl-3.5"} ${theme.focus}`}
        />
      </div>
    </FieldShell>
  );
}

/* ------------------------------ PhoneField ------------------------------ */

interface PhoneFieldProps {
  label: string;
  name: string;
  value?: string;
  onChange: TextFieldProps["onChange"];
  theme: Theme;
  prefix: React.ReactNode;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  wrapperClassName?: string;
}

export function PhoneField({
  label,
  name,
  value,
  onChange,
  theme,
  prefix,
  placeholder,
  required,
  maxLength,
  wrapperClassName,
}: PhoneFieldProps) {
  return (
    <FieldShell
      label={label}
      htmlFor={name}
      required={required}
      wrapperClassName={wrapperClassName}
    >
      <div
        className={`flex overflow-hidden rounded-lg border border-gray-300 bg-white transition focus-within:ring-2 ${theme.focus}`}
      >
        {prefix}
        <input
          id={name}
          name={name}
          type="tel"
          inputMode="numeric"
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          className="w-full px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
      </div>
    </FieldShell>
  );
}
