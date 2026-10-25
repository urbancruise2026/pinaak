// components/ui/pagination.tsx
import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  rowsPerPage,
  onPageChange,
}: PaginationProps) {
  const pages = totalPages || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  const canPrev = currentPage > 1;
  const canNext = totalPages > 0 && currentPage < totalPages;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-3 py-2 border-t border-[#1e2b45] bg-[#0f1a2e]">
      <p className="text-xs font-semibold text-slate-300">
        Page {currentPage} of {pages} • Total {totalItems} Items • Showing{" "}
        {startItem} – {endItem}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(currentPage - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-red-500 bg-transparent text-red-400 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-red-400"
          aria-label="Previous page"
        >
          ←
        </button>

        {/* Current page indicator (not a button — the old one jumped forward on click) */}
        <span
          aria-current="page"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white text-sm font-semibold ring-2 ring-blue-400/40"
        >
          {currentPage}
        </span>

        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(currentPage + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-emerald-500 bg-transparent text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-emerald-400"
          aria-label="Next page"
        >
          →
        </button>
      </div>
    </div>
  );
}