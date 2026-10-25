"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, ClipboardList, StickyNote, ChevronDown } from "lucide-react";
import { Section } from "./FormParts";
import type { Theme } from "./FormParts";
import { THEMES as T } from "./constants";
import { getAllCitiesThunk } from "@/features/location/travelcitySlice"; // CHECK: apna path

export interface FormCharge {
  charge_name: string;
  charge_detail: string;
  is_included: boolean;
}

export interface FormNote {
  note_text: string;
  template_id?: number; // backend ke note_templates.id
}

interface Props {
  charges: FormCharge[];
  notes: FormNote[];
  chargesLoading?: boolean;
  notesLoading?: boolean;
  chargesError?: string | null;
  notesError?: string | null;
  onChargesChange: (next: FormCharge[]) => void;
  onNotesChange: (next: FormNote[]) => void;
}

/* =====================================================
   STORE KEY
   CHECK: store file me city slice jis naam se register hai wahi likho
   e.g. reducer: { travelcity: cityReducer }  -> "travelcity"
===================================================== */
const STORE_KEY = "travelcity";

/* Theme-based classes (theme strings are full static Tailwind classes) */
const addBtn = (theme: Theme) =>
  `inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition active:scale-[0.98] ${theme.button}`;

const badgeCls = (theme: Theme) =>
  `flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold ${theme.iconBox}`;

/* =====================================================
   PICKUP NOTE (template id = 2)
   "KM will be counted from [button]" -> button click = 2 options
===================================================== */
const PICKUP_NOTE_TEMPLATE_ID = 2;
const PICKUP_PREFIX = "KM will be counted from ";

const PICKUP_OPTIONS = [
  "Pickup Point to Pickup Point.",
  "Pickup Point to Garage.",
];

const isPickupNoteText = (text: string) => text.startsWith(PICKUP_PREFIX);

/* =====================================================
   CITY NOTE
   "Visit to Local [City] Places is not included in cost."
   City = button -> click = sabhi cities ki list
===================================================== */
const CITY_NOTE_REGEX =
  /^(Visit to Local )(.+?)( Places is not included in cost\.?)$/i;

const matchCityNote = (text: string) => text.match(CITY_NOTE_REGEX);

/* =====================================================
   WORD HIGHLIGHT RULES
   (pattern me capture group "( )" mat use karna, sirf "(?: )")
===================================================== */
interface HighlightRule {
  pattern: string;
  className: string;
}

// Notes: "include/includes/included" = green, "switch off/switched off" = red
const NOTE_RULES: HighlightRule[] = [
  { pattern: "\\bincluded?\\b|\\bincludes\\b", className: "text-green-600" },
  { pattern: "\\bswitch(?:ed)?\\s+off\\b", className: "text-red-600" },
];

// Other Charges: "NOT" = red
const CHARGE_RULES: HighlightRule[] = [
  { pattern: "\\bNOT\\b", className: "text-red-600" },
];

function renderHighlighted(text: string, rules: HighlightRule[]) {
  if (!text || rules.length === 0) return text;

  const re = new RegExp(rules.map((r) => `(${r.pattern})`).join("|"), "gi");
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m[0].length === 0) {
      re.lastIndex++;
      continue;
    }
    if (m.index > last) out.push(text.slice(last, m.index));
    const ruleIdx = m.slice(1).findIndex((g) => g !== undefined);
    out.push(
      <span key={m.index} className={rules[ruleIdx].className}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/* =====================================================
   HighlightedField
   - peeche: highlighted (colored) text layer
   - upar: transparent textarea (typing, cursor, selection)
   - bold prop: true = bold (Notes, Charge Name), false = normal (Charge Detail)
===================================================== */
interface HighlightedFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  theme: Theme;
  rules: HighlightRule[];
  rows?: number;
  singleLine?: boolean;
  bold?: boolean;
}

function HighlightedField({
  value,
  onChange,
  placeholder,
  theme,
  rules,
  rows = 1,
  singleLine = false,
  bold = true,
}: HighlightedFieldProps) {
  const weight = bold ? "font-bold" : "font-normal";

  return (
    <div className="relative w-full rounded-lg bg-white">
      {/* Highlight layer (height yahi decide karti hai) */}
      <div
        aria-hidden="true"
        className={`pointer-events-none whitespace-pre-wrap break-words rounded-lg border border-transparent px-3 py-2 text-sm ${weight} text-gray-800`}
        style={{ minHeight: `calc(${rows * 1.25}rem + 1rem + 2px)` }}
      >
        {renderHighlighted(value, rules)}
        {/* trailing newline / empty value ke liye height maintain */}
        {value.endsWith("\n") ? " " : "\u200b"}
      </div>

      {/* Real input (text transparent, caret visible) */}
      <textarea
        className={`absolute inset-0 h-full w-full resize-none overflow-hidden rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm ${weight} text-transparent caret-gray-800 outline-none transition focus:ring-2 placeholder:font-normal placeholder:text-gray-400 ${theme.focus}`}
        placeholder={placeholder}
        value={value}
        rows={rows}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={
          singleLine
            ? (e) => {
                if (e.key === "Enter") e.preventDefault();
              }
            : undefined
        }
      />
    </div>
  );
}

/* =====================================================
   PickupNote
   Sentence ke andar button -> click -> 2 options ka menu
===================================================== */
interface PickupNoteProps {
  value: string;
  onChange: (value: string) => void;
  theme: Theme;
  rows?: number;
}

function PickupNote({ value, onChange, theme, rows = 2 }: PickupNoteProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Abhi selected option kaunsa hai
  const rest = value.startsWith(PICKUP_PREFIX)
    ? value.slice(PICKUP_PREFIX.length)
    : "";
  const selected = PICKUP_OPTIONS.includes(rest) ? rest : PICKUP_OPTIONS[0];

  // Agar value empty / alag hai (template id = 2 pe), to default set kar do
  useEffect(() => {
    const full = PICKUP_PREFIX + selected;
    if (value !== full) onChange(full);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Bahar click / scroll / resize pe menu band
  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const close = () => setOpen(false);

    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left });
    }
    setOpen((o) => !o);
  };

  return (
    <div
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800"
      style={{ minHeight: `calc(${rows * 1.25}rem + 1rem + 2px)` }}
    >
      <span>{PICKUP_PREFIX}</span>

      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-bold transition active:scale-[0.98] ${theme.button}`}
      >
        {selected}
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[220px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
          style={{ top: pos.top, left: pos.left }}
        >
          {PICKUP_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(PICKUP_PREFIX + opt);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                opt === selected
                  ? "bg-gray-50 font-bold text-gray-900"
                  : "font-medium text-gray-700"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* =====================================================
   CityNote
   "Visit to Local [Delhi] Places is not included in cost."
   [Delhi] button -> click -> redux ki saari cities ki list
===================================================== */
interface CityNoteProps {
  value: string;
  onChange: (value: string) => void;
  theme: Theme;
  cities: string[];
  loading?: boolean;
  rows?: number;
}

function CityNote({
  value,
  onChange,
  theme,
  cities,
  loading,
  rows = 2,
}: CityNoteProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Bahar click / scroll / resize pe menu band (menu ke andar scroll allowed)
  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onScroll = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const close = () => setOpen(false);

    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 4, left: r.left });
    }
    setOpen((o) => !o);
  };

  // Saare hooks ke BAAD (Rules of Hooks)
  const m = matchCityNote(value);
  if (!m) return null;
  const [, prefix, city, suffix] = m;

  return (
    <div
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold text-gray-800"
      style={{ minHeight: `calc(${rows * 1.25}rem + 1rem + 2px)` }}
    >
      <span>{renderHighlighted(prefix, NOTE_RULES)}</span>

      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-sm font-bold transition active:scale-[0.98] ${theme.button}`}
      >
        {city}
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <span>{renderHighlighted(suffix, NOTE_RULES)}</span>

      {open && (
        <div
          ref={menuRef}
          className="fixed z-50 max-h-60 min-w-[180px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
          style={{ top: pos.top, left: pos.left }}
        >
          {loading && cities.length === 0 && (
            <p className="px-3 py-2 text-sm font-medium text-gray-500">
              Loading cities...
            </p>
          )}

          {!loading && cities.length === 0 && (
            <p className="px-3 py-2 text-sm font-medium text-gray-500">
              No cities found
            </p>
          )}

          {cities.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => {
                onChange(prefix + name + suffix);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                name === city
                  ? "bg-gray-50 font-bold text-gray-900"
                  : "font-medium text-gray-700"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChargesNotesSection({
  charges,
  notes,
  chargesLoading,
  notesLoading,
  chargesError,
  notesError,
  onChargesChange,
  onNotesChange,
}: Props) {
  const dispatch = useDispatch<any>();

  // Safe selector: key galat ho tab bhi crash nahi hoga
  const cityState = useSelector((s: any) => s?.[STORE_KEY]);
  const travelcity: any[] = cityState?.travelcity ?? [];
  const cityLoading: boolean = cityState?.loading ?? false;

  const cityNames: string[] = travelcity
    .map((c: any) => c.cityName)
    .filter(Boolean);

  // Agar koi city wala note hai aur cities load nahi hui, to fetch karo
  const hasCityNote = notes.some((n) => matchCityNote(n.note_text));
  useEffect(() => {
    if (hasCityNote && travelcity.length === 0) {
      dispatch(getAllCitiesThunk());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCityNote]);

  const updateCharge = (index: number, patch: Partial<FormCharge>) => {
    onChargesChange(
      charges.map((charge, i) =>
        i === index ? { ...charge, ...patch } : charge,
      ),
    );
  };

  // ...note use kiya taaki template_id delete na ho
  const updateNote = (index: number, value: string) => {
    onNotesChange(
      notes.map((note, i) =>
        i === index ? { ...note, note_text: value } : note,
      ),
    );
  };

  return (
    /* Charges = left, Notes = right (stacked on small screens) */
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      {/* =====================================================
          NOTES (RIGHT)
      ===================================================== */}
      <div className="min-w-0">
        <Section
          theme={T.notes}
          Icon={StickyNote}
          title="Notes"
          gridClassName="space-y-3"
          action={
            <button
              type="button"
              className={addBtn(T.notes)}
              onClick={() =>
                onNotesChange([
                  ...notes,
                  {
                    note_text: "",
                  },
                ])
              }
            >
              <Plus size={16} />
              Add Note
            </button>
          }
        >
          {notesLoading && (
            <p className="py-4 text-center text-sm text-gray-500">
              Loading notes...
            </p>
          )}

          {notesError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">{notesError}</p>
            </div>
          )}

          {!notesLoading && !notesError && notes.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
              <p className="text-sm font-medium text-gray-600">
                No notes added
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Click "Add Note" to add a note.
              </p>
            </div>
          )}

          {!notesLoading && notes.length > 0 && (
            <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full min-w-[300px] border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="w-12 px-3 py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-900">
                      #
                    </th>

                    <th className="px-3 py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-900">
                      Note
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {notes.map((note, index) => {
                    const isPickupNote =
                      note.template_id === PICKUP_NOTE_TEMPLATE_ID ||
                      isPickupNoteText(note.note_text);
                    const isCityNote = !!matchCityNote(note.note_text);

                    return (
                      <tr
                        key={index}
                        className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70"
                      >
                        <td className="px-3 py-3 align-top">
                          <span className={badgeCls(T.notes)}>{index + 1}</span>
                        </td>

                        <td className="px-1 py-1">
                          {isPickupNote ? (
                            <PickupNote
                              theme={T.notes}
                              value={note.note_text}
                              onChange={(v) => updateNote(index, v)}
                            />
                          ) : isCityNote ? (
                            <CityNote
                              theme={T.notes}
                              value={note.note_text}
                              cities={cityNames}
                              loading={cityLoading}
                              onChange={(v) => updateNote(index, v)}
                            />
                          ) : (
                            <HighlightedField
                              theme={T.notes}
                              rules={NOTE_RULES}
                              rows={2}
                              placeholder="Write note..."
                              value={note.note_text}
                              onChange={(v) => updateNote(index, v)}
                            />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>

      {/* =====================================================
          OTHER CHARGES (LEFT)
      ===================================================== */}
      <div className="min-w-0">
        <Section
          theme={T.charges}
          Icon={ClipboardList}
          title="Other Charges"
          gridClassName="space-y-3"
          action={
            <button
              type="button"
              className={addBtn(T.charges)}
              onClick={() =>
                onChargesChange([
                  ...charges,
                  {
                    charge_name: "",
                    charge_detail: "",
                    is_included: false,
                  },
                ])
              }
            >
              <Plus size={16} />
              Add Charge
            </button>
          }
        >
          {chargesLoading && (
            <p className="py-4 text-center text-sm text-gray-500">
              Loading charges...
            </p>
          )}

          {chargesError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">{chargesError}</p>
            </div>
          )}

          {!chargesLoading && !chargesError && charges.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center">
              <p className="text-sm font-medium text-gray-600">
                No charges added
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Click "Add Charge" to add an additional charge.
              </p>
            </div>
          )}

          {!chargesLoading && charges.length > 0 && (
            <div className="w-full overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full min-w-[420px] border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="w-12 px-3 py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-900">
                      #
                    </th>

                    <th className="w-[35%] px-3 py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-900">
                      Charge Name
                    </th>

                    <th className="px-3 py-3 text-left text-xs font-extrabold uppercase tracking-wide text-gray-900">
                      Charge Detail
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {charges.map((charge, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70"
                    >
                      {/* Number */}
                      <td className="px-3 py-3 align-top">
                        <span className={badgeCls(T.charges)}>{index + 1}</span>
                      </td>

                      {/* Charge Name (BOLD) */}
                      <td className="px-3 py-3 align-top">
                        <HighlightedField
                          theme={T.charges}
                          rules={CHARGE_RULES}
                          singleLine
                          placeholder="Charge name"
                          value={charge.charge_name}
                          onChange={(v) =>
                            updateCharge(index, { charge_name: v })
                          }
                        />
                      </td>

                      {/* Charge Detail (NOT bold) */}
                      <td className="px-3 py-3 align-top">
                        <HighlightedField
                          theme={T.charges}
                          rules={CHARGE_RULES}
                          singleLine
                          bold={false}
                          placeholder="Enter charge detail..."
                          value={charge.charge_detail}
                          onChange={(v) =>
                            updateCharge(index, { charge_detail: v })
                          }
                        />
                      </td>

                      {/* Included checkbox (hidden for now) — purana commented code yahan rakh sakte ho */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
