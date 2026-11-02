import React from "react";
import type { FormState, SetField, Theme } from "./types";

/* ---------- shared input styles ---------- */

export const inputCls =
  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-base text-slate-800 shadow-sm placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100";

export const textareaCls =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-800 shadow-sm placeholder:text-slate-400 transition-colors hover:border-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100";

/* ---------- input binding helper ---------- */

type StringKeys = {
  [K in keyof FormState]: FormState[K] extends string ? K : never;
}[keyof FormState];

/** Spread onto an <input>/<select>/<textarea> to wire it to a string field */
export const bind = (form: FormState, set: SetField, key: StringKeys) => ({
  value: form[key],
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => set(key, e.target.value),
});

/* ---------- card with a softly tinted header ---------- */

export const Section = ({
  title,
  icon: Icon,
  theme,
  badge,
  right,
  children,
}: {
  title: string;
  icon: React.ElementType;
  theme: Theme;
  badge?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header
      className={`flex flex-wrap items-center gap-3 border-b px-5 py-3.5 ${theme.header} ${theme.border}`}
    >
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ${theme.text}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {badge && (
        <span
          className={`rounded-full border bg-white px-3 py-0.5 text-sm font-medium ${theme.border} ${theme.text}`}
        >
          {badge}
        </span>
      )}
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </header>
    {children}
  </section>
);

/* ---------- label | input table ---------- */

export interface FieldDef {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export const FormTable = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-x-auto">
    <table className="w-full border-collapse text-base">
      <tbody className="divide-y divide-slate-100">{children}</tbody>
    </table>
  </div>
);

const LabelCell = ({ f }: { f: FieldDef }) => (
  <th
    scope="row"
    className="block bg-slate-50 px-4 pb-1 pt-3 text-left text-sm font-semibold text-slate-600 md:table-cell md:w-48 md:border-r md:border-slate-100 md:py-3 md:align-middle"
  >
    {f.label}
    {f.required && <span className="text-red-500"> *</span>}
  </th>
);

const InputCell = ({ f, colSpan }: { f: FieldDef; colSpan?: number }) => (
  <td
    colSpan={colSpan}
    data-error={f.error ? "true" : undefined}
    className={`block px-4 pb-3 pt-1 md:table-cell md:py-3 md:align-middle ${
      f.error
        ? "[&_input]:!border-red-300 [&_select]:!border-red-300 [&_textarea]:!border-red-300"
        : ""
    }`}
  >
    {f.children}
    {f.error ? (
      <p className="mt-1 text-sm text-red-500">{f.error}</p>
    ) : f.hint ? (
      <p className="mt-1 text-[13px] text-slate-500">{f.hint}</p>
    ) : null}
  </td>
);

/** One table row: either a single field (full width) or two side by side */
export const TRow = ({ a, b }: { a: FieldDef; b?: FieldDef }) => (
  <tr className="block md:table-row">
    <LabelCell f={a} />
    <InputCell f={a} colSpan={b ? 1 : 3} />
    {b && (
      <>
        <LabelCell f={b} />
        <InputCell f={b} />
      </>
    )}
  </tr>
);

/** Tinted sub-heading row, used to mark Personal-only / Corporate-only fields */
export const GroupRow = ({
  theme,
  children,
}: {
  theme: Theme;
  children: React.ReactNode;
}) => (
  <tr className="block md:table-row">
    <td
      colSpan={4}
      className={`block border-y px-4 py-2 text-xs font-semibold uppercase tracking-wide md:table-cell ${theme.soft} ${theme.border} ${theme.text}`}
    >
      {children}
    </td>
  </tr>
);

/** Read-only value box (auto-calculated fields), softly highlighted */
export const ReadOnly = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-11 items-center rounded-xl border border-amber-200 bg-amber-50 px-3.5 text-base font-semibold text-slate-800">
    {children}
  </div>
);
