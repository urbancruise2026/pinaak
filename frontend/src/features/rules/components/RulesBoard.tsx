"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import EntryForm, { Entry, EntryType, EntryPayload } from "@/features/rules/components/Entryform";
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  Users,
  BarChart3,
  X,
  Target,
  AlertTriangle,
  CheckCircle2,
  Zap,
  BarChart,
  RefreshCw,
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useAppDispatch } from "@/hooks/useRedux";
import {
  fetchRuleEntries,
  createRuleEntry,
  updateRuleEntry,
  deleteRuleEntry,
} from "@/features/rules/rulesSlice";

type MonthEntry = {
  time?: string;
  name: string;
  lead: number;
};

type MonthColumn = {
  key: string;
  label: string;
  isCurrent: boolean;
};

function getMonthColumns(count = 2): MonthColumn[] {
  const now = new Date();
  const cols: MonthColumn[] = [];

  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-US", { month: "short" }).toUpperCase();
    cols.push({ key, label, isCurrent: i === 0 });
  }

  return cols;
}

const ROW_COLORS = [
  "text-yellow-400",
  "text-cyan-300",
  "text-pink-400",
  "text-lime-300",
  "text-orange-300",
];

const ALLOWED_ROLES = ["city manager", "team leader-sales"];

function getMonthLead(entry: Entry, columnLabel: string) {
  return entry.monthLeads?.find(
    (ml) => ml.month.toUpperCase() === columnLabel.toUpperCase(),
  );
}

function sumLeadsAcrossMonths(entries: Entry[], monthColumns: MonthColumn[]) {
  return entries.reduce((sum, e) => {
    const entryMonthTotal = monthColumns.reduce((s, col) => {
      const ml = getMonthLead(e, col.label);

      const numericLead = ml ? Number(ml.lead) : 0;
      return s + (Number.isFinite(numericLead) ? numericLead : 0);
    }, 0);
    return sum + entryMonthTotal;
  }, 0);
}

function countLeadEntriesAcrossMonths(
  entries: Entry[],
  monthColumns: MonthColumn[],
) {
  return entries.reduce((count, e) => {
    const entryMonthCount = monthColumns.reduce(
      (c, col) => c + (getMonthLead(e, col.label) ? 1 : 0),
      0,
    );
    return count + entryMonthCount;
  }, 0);
}

export default function RulesBoard() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | EntryType>("ALL");
  const [showForm, setShowForm] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const dispatch = useAppDispatch();
  const { entries } = useSelector((state: RootState) => state.rule);

  const currentUser = useSelector((state: RootState) => state.user.currentUser);

  const canAddRule =
    currentUser?.subDepartment_name === "Tele-Sales" &&
    ALLOWED_ROLES.includes((currentUser?.role_name ?? "").toLowerCase());

  const monthColumns = getMonthColumns(3);

  useEffect(() => {
    dispatch(fetchRuleEntries());
  }, [dispatch]);

  useEffect(() => {
    document.body.style.overflow =
      showForm || confirmDeleteId !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showForm, confirmDeleteId]);

  // Auto-hide the success toast after 3s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

async function handleSubmit(payload: EntryPayload) {
  try {
    if (editingId !== null) {
      await dispatch(updateRuleEntry({ id: editingId, data: payload })).unwrap();
    } else {
      await dispatch(createRuleEntry(payload)).unwrap();
    }
    await dispatch(fetchRuleEntries());
    setEditingId(null);
    setShowForm(false);
  } catch (e) {
    setToast(e instanceof Error ? e.message : "Failed to save entry");
    // keep the modal open so the user can retry
  }
}

  function startEdit(entry: Entry) {
    setEditingId(entry.id);
    setShowForm(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setShowForm(false);
  }

  function requestDelete(id: number) {
    setConfirmDeleteId(id);
  }

  function confirmDelete() {
    if (confirmDeleteId === null) return;
    dispatch(deleteRuleEntry(confirmDeleteId));
    if (editingId === confirmDeleteId) {
      setEditingId(null);
      setShowForm(false);
    }
    setConfirmDeleteId(null);
    setToast("Entry successfully deleted");
  }

  function cancelDelete() {
    setConfirmDeleteId(null);
  }

  function toggleAddForm() {
    setEditingId(null);
    setShowForm(true);
  }

  // Manually refresh the entries from the server
  async function handleRefresh() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await dispatch(fetchRuleEntries());
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  }

  const visible: Entry[] = (entries || []).filter(
    (e: Entry) => activeFilter === "ALL" || e.type === activeFilter,
  );

  const t20Entries = visible.filter((e) => e.type === "T20");
  const t60Entries = visible.filter((e) => e.type === "T60");

  const editingEntry =
    (entries || []).find((e: Entry) => e.id === editingId) ?? null;

  const totalCount = sumLeadsAcrossMonths(visible, monthColumns);
  const totalEntries = countLeadEntriesAcrossMonths(visible, monthColumns);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8 px-4">
      <div className="max-w-full mx-auto">
        <div className="sticky top-0 z-20 mb-8">
          <div className="rounded-2xl border border-orange-200/60 bg-white/90 backdrop-blur-xl shadow-xl shadow-orange-100 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-5">
              {/* Left */}
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Enquiry Management Board
                  </h1>

                  <p className="text-sm text-slate-500">
                    Manage Reminder Rules & Follow-ups
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Total Entries (actual leads-table entries, respects filter) */}
                <div className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 shadow-sm hover:shadow-md transition">
                  <Users className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-slate-500">Entries</p>
                    <p className="font-bold text-slate-700">{totalEntries}</p>
                  </div>
                </div>

                {/* Total Count (sum of leads, respects filter) */}
                <div className="flex items-center gap-2 rounded-xl border bg-white px-4 py-3 shadow-sm hover:shadow-md transition">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="font-bold text-slate-700">{totalCount}</p>
                  </div>
                </div>

                {/* Filter */}
                <div className="flex rounded-xl border bg-slate-100 p-1">
                  {(["ALL", "T20", "T60"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                        activeFilter === f
                          ? "bg-orange-600 text-white shadow-lg"
                          : "text-slate-600 hover:bg-white hover:text-orange-600"
                      }`}
                    >
                      {f === "ALL" ? "All" : f === "T20" ? "T-20" : "T-60"}
                    </button>
                  ))}
                </div>

                {/* Refresh Button */}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  title="Refresh"
                  className="flex items-center justify-center gap-2 rounded-xl border bg-white px-4 py-3 font-semibold text-slate-600 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:text-orange-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                {/* Add Button */}
                {canAddRule && (
                  <button
                    onClick={toggleAddForm}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 font-semibold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    <Plus className="h-5 w-5" />
                    Add New Rule
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BoardSection
            title="T-20 Tempo Traveller"
            icon={<Zap className="w-5 h-5 text-white" />}
            gradient="from-orange-500 to-amber-500"
            bgGradient="from-orange-50 to-amber-50/50"
            headerClass="bg-orange-700 text-white"
            tableTheme="orange"
            entries={t20Entries}
            monthColumns={monthColumns}
            onEdit={startEdit}
            onDelete={requestDelete}
            show={activeFilter === "ALL" || activeFilter === "T20"}
          />
          <BoardSection
            title="T-60 Bus"
            icon={<BarChart className="w-5 h-5 text-white" />}
            gradient="from-emerald-500 to-teal-500"
            bgGradient="from-emerald-50 to-teal-50/50"
            headerClass="bg-green-800 text-white"
            tableTheme="green"
            entries={t60Entries}
            monthColumns={monthColumns}
            onEdit={startEdit}
            onDelete={requestDelete}
            show={activeFilter === "ALL" || activeFilter === "T60"}
          />

          {visible.length === 0 && (
            <div className="lg:col-span-2 flex-1 flex flex-col items-center justify-center gap-4 text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200 py-16 px-8">
              <div className="p-4 bg-slate-50 rounded-full">
                <Plus className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="font-medium text-slate-600">No any Entry </p>
                <p className="text-sm">No any Entry in this Form</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={cancelEdit}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 w-full max-w-xl max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={cancelEdit}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors z-10"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
            <div className="p-6">
              <EntryForm
                editingEntry={editingEntry}
                onSubmit={handleSubmit}
                onCancel={cancelEdit}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {confirmDeleteId !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          onClick={cancelDelete}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-slate-200/60 w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-3">
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Delete this entry?
              </h3>
              <p className="text-sm text-slate-500">
                Are you sure you want to delete this data?
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={cancelDelete}
                className="px-5 py-2 rounded-full text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/25 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[70]">
          <div className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-full shadow-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium">{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
type TableTheme = "orange" | "green";

type ThemeClasses = {
  bg: string;
  borderStrong: string;
  borderSoft: string;
  hover: string;
};

const TABLE_THEME_CLASSES: { orange: ThemeClasses; green: ThemeClasses } = {
  orange: {
    bg: "bg-orange-50/40",
    borderStrong: "border-grey-500",
    borderSoft: "border-grey-500",
    hover: "hover:bg-orange-100/60",
  },
  green: {
    bg: "bg-emerald-50/40",
    borderStrong: "border-grey-500",
    borderSoft: "border-grey-500",
    hover: "hover:bg-emerald-100/60",
  },
};


const MONTH_COLUMN_COLORS: Record<
  TableTheme,
  { header: string; cell: string; border: string }[]
> = {
  orange: [
    {
      header: "bg-amber-500 text-white",
      cell: "bg-amber-100",
      border: "border-grey-500",
    },
    {
      header: "bg-orange-600 text-white",
      cell: "bg-orange-100",
      border: "border-grey-500",
    },
    {
      header: "bg-red-500 text-white",
      cell: "bg-red-100",
      border: "border-grey-500",
    },
  ],
  green: [
    {
      header: "bg-emerald-500 text-white",
      cell: "bg-emerald-100",
      border: "border-grey-500",
    },
    {
      header: "bg-teal-600 text-white",
      cell: "bg-teal-100",
      border: "border-grey-500",
    },
    {
      header: "bg-cyan-700 text-white",
      cell: "bg-cyan-100",
      border: "border-grey-500",
    },
  ],
};

function getMonthColor(theme: TableTheme, index: number) {
  const palette = MONTH_COLUMN_COLORS[theme];
  return palette[index % palette.length];
}


function getNextMonthLabel(key: string) {
  const [yearStr, monthStr] = key.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr); // 1-12, already the next zero-indexed month
  const d = new Date(year, month, 1);
  return d.toLocaleString("en-US", { month: "short" }).toUpperCase();
}

function getStartTimeInMinutes(shift: string) {
  if (!shift) return Number.MAX_SAFE_INTEGER;

  const startTime = shift.split("-")[0].trim();

  const match = startTime.match(/(\d+):(\d+)\s*(am|pm)/i);

  if (!match) return Number.MAX_SAFE_INTEGER;

  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const period = match[3].toLowerCase();

  if (period === "pm" && hour !== 12) hour += 12;
  if (period === "am" && hour === 12) hour = 0;

  return hour * 60 + minute;
}

function BoardSection({
  title,
  icon,
  gradient,
  bgGradient,
  headerClass,
  tableTheme,
  entries,
  monthColumns,
  onEdit,
  onDelete,
  show,
  titleClassName,
}: {
  title: string;
  icon: ReactNode;
  gradient: string;
  bgGradient: string;
  headerClass: string;
  tableTheme: TableTheme;
  entries: Entry[];
  monthColumns: MonthColumn[];
  onEdit: (e: Entry) => void;
  onDelete: (id: number) => void;
  show: boolean;
  titleClassName?: string;
}) {
  if (!show) return null;

  const totalCount = sumLeadsAcrossMonths(entries, monthColumns);
  const sortedEntries = [...entries].sort(
    (a, b) =>
      getStartTimeInMinutes(a.shiftTiming) -
      getStartTimeInMinutes(b.shiftTiming),
  );

  const t = TABLE_THEME_CLASSES[tableTheme];

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden flex-1 flex flex-col transition-all hover:shadow-2xl hover:shadow-slate-200/60">
      <div
        className={`bg-gradient-to-r ${bgGradient} px-6 py-4 border-b border-slate-200/60 `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center text-white shadow-lg`}
            >
              {icon}
            </div>
            <div>
              <h3
                className={`${titleClassName ?? "text-[40px]"} font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent leading-tight`}
              >
                {title}
              </h3>
              <p className="flex items-center gap-5 text-xl text-slate-500 font-semibold">
                <span className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  <span>{entries.length} Persons</span>
                </span>

                <span className="w-1 h-1 rounded-full bg-slate-400"></span>

                <span className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-emerald-600" />
                  <span>{totalCount} Leads</span>
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-md font-semibold text-slate-400 bg-white/60 px-3 py-1 rounded-full border border-slate-200/60 backdrop-blur-sm">
              {entries.length}
            </span>
          </div>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm py-10">
          <span className="opacity-60">New entry</span>
        </div>
      ) : (
        <div className={`overflow-auto max-h-[420px] ${t.bg}`}>
          <table className={`w-full border-collapse text-center ${t.bg}`}>
            <thead>
              <tr>
                <th className={`border ${t.borderStrong} p-3 ${headerClass}`}>
                  Shift
                </th>
                {monthColumns.map((col, idx) => {
                  const c = getMonthColor(tableTheme, idx);
                  const isLast = idx === monthColumns.length - 1;
                  const headerLabel = isLast
                    ? `${col.label} (Future Month)`
                    : col.label;
                  return (
                    <th
                      key={col.key}
                      className={`border ${c.border} p-3 ${c.header}`}
                    >
                      {headerLabel}
                    </th>
                  );
                })}
                <th
                  className={`border ${t.borderStrong} p-3 w-32 ${headerClass}`}
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedEntries.map((e) => (
                <tr
                  key={e.id}
                  className={`${t.bg} ${t.hover} transition-colors`}
                >
                  <td className={`border ${t.borderSoft} p-3 font-semibold `}>
                    {e.shiftTiming}
                  </td>

                  {monthColumns.map((col, idx) => {
                    const ml = getMonthLead(e, col.label);
                    const c = getMonthColor(tableTheme, idx);
                    return (
                      <td
                        key={col.key}
                        className={`border ${c.border} p-3 text-center ${c.cell}`}
                      >
                        {ml ? (
                          <>
                            <span className="font-semibold text-lg">
                              {e.advisorName}
                            </span>
                            <span className="text-red-500 font-bold">
                              {" "}
                              ({ml.lead})
                            </span>
                          </>
                        ) : (
                          "-"
                        )}
                      </td>
                    );
                  })}
                  <td className={`border ${t.borderSoft} p-3`}>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onEdit(e)}
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(e.id)}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="border border-slate-300 p-3 text-center font-extrabold bg-white text-slate-800">
                  Total Leads
                </td>
                {monthColumns.map((col) => {
                  // Same fix as sumLeadsAcrossMonths: coerce to Number so a
                  // string lead value ("7") is added numerically instead of
                  // being concatenated onto the running total as text.
                  const monthTotal = entries.reduce((sum, e) => {
                    const ml = getMonthLead(e, col.label);
                    const numericLead = ml ? Number(ml.lead) : 0;
                    return (
                      sum + (Number.isFinite(numericLead) ? numericLead : 0)
                    );
                  }, 0);
                  return (
                    <td
                      key={col.key}
                      className="border border-slate-300 p-3 text-center font-bold bg-white text-slate-800"
                    >
                      {monthTotal}
                    </td>
                  );
                })}
                <td className="border border-slate-300 p-3 font-bold bg-white text-slate-800"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
