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
  const pages = Math.max(totalPages, 1);

  const start =
    totalItems === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;

  const end = Math.min(currentPage * rowsPerPage, totalItems);

  const canPrev = currentPage > 1;
  const canNext = currentPage < pages;

  // Generate visible page numbers
  const getPageNumbers = (): (number | "...")[] => {
    if (pages <= 7) {
      return Array.from({ length: pages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", pages];
    }

    if (currentPage >= pages - 3) {
      return [
        1,
        "...",
        pages - 4,
        pages - 3,
        pages - 2,
        pages - 1,
        pages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
      "...",
      pages,
    ];
  };

  const pageNumbers = getPageNumbers();

  const navButton =
    "h-[30px] min-w-[60px] px-3 border border-slate-300 rounded-[3px] text-[11px] font-semibold tracking-wide text-slate-600 hover:bg-slate-100 hover:border-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors";

  return (
    <div className="flex shrink-0 items-center justify-between px-1">
      {/* Showing records */}
      <p className="text-xs text-slate-500">
        Showing {start}–{end} of {totalItems}
      </p>

      {/* Pagination */}
      <div className="flex items-center gap-2">

        {/* Previous */}
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
          className={navButton}
        >
          PREV
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`dots-${index}`}
                  className="flex h-[27px] w-5 items-center justify-center text-xs text-slate-500"
                >
                  ...
                </span>
              );
            }

            const isActive = currentPage === page;

            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-label={`Go to page ${page}`}
                aria-current={isActive ? "page" : undefined}
                className={`
                  flex h-[27px] min-w-[27px] items-center justify-center
                  rounded-[3px] text-xs font-medium transition-colors
                  ${
                    isActive
                      ? "bg-[#C5CDCE] text-slate-800"
                      : "text-slate-600 hover:bg-slate-100"
                  }
                `}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next */}
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
          className={navButton}
        >
          NEXT
        </button>

      </div>
    </div>
  );
}