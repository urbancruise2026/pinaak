export const tableStyles = {
  wrapper:
    "flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white",
  scroll: "min-h-0 flex-1 overflow-auto",

  headerRow: "",
  row: "border-b border-slate-100 last:border-0 hover:bg-indigo-50/40",
  evenRow: "bg-white",
  oddRow: "bg-slate-50/60",

  headerCell:
    "sticky top-0 z-10 whitespace-nowrap bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200",
  stickyHeaderCell:
    "sticky top-0 left-0 z-20 whitespace-nowrap bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 border-b border-slate-200",

  cell: "whitespace-nowrap px-4 py-2.5 text-sm text-slate-700",
  stickyCell:
    "sticky left-0 z-[1] whitespace-nowrap px-4 py-2.5 text-sm text-slate-500",
  stickyEvenCell: "bg-white",
  stickyOddCell: "bg-slate-50",
};