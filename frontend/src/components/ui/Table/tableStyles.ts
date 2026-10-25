export const tableStyles = {
  wrapper:
    "w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md",

  scroll: "w-full overflow-x-auto",
  table: "w-full min-w-[1500px] border-collapse",
  header: "sticky top-0",
  headerRow:
    "bg-orange-700 text-left text-sm font-semibold text-white shadow-md",
  headerCell:
    "whitespace-nowrap bg-orange-700 px-3 py-4 text-left text-sm font-semibold text-white",
  stickyHeaderCell:
    "sticky left-0 whitespace-nowrap bg-orange-700 px-3 py-4 text-left text-sm font-semibold text-white",
  row: "group border-b border-slate-100 transition-all duration-200 hover:bg-orange-50 hover:shadow-sm",
  evenRow: "bg-white",
  oddRow: "bg-slate-50/70",
  cell: "whitespace-nowrap px-3 py-3.5 text-sm text-gray-700",
  stickyCell:
    "sticky left-0 whitespace-nowrap px-3 py-3.5 text-sm font-semibold text-gray-700 transition-colors duration-200",
  stickyEvenCell: "bg-white group-hover:bg-orange-50",
  stickyOddCell: "bg-slate-50 group-hover:bg-orange-50",
  emptyCell: "px-3 py-14 text-center text-gray-500",
};
