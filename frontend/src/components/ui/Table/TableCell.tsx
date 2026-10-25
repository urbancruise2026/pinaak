"use client";

import React from "react";
import { tableStyles } from "./tableStyles";

interface TableCellProps {
  children: React.ReactNode;
  header?: boolean;
  sticky?: boolean;
  rowIndex?: number;
  className?: string;
  title?: string;
}
const TableCell: React.FC<TableCellProps> = ({
  children,
  header = false,
  sticky = false,
  rowIndex = 0,
  className = "",
}) => {
  if (header) {
    return (
      <th
        className={`
          ${sticky ? tableStyles.stickyHeaderCell : tableStyles.headerCell}
          ${className}
        `}
      >
        {children}
      </th>
    );
  }
  const isEven = rowIndex % 2 === 0;
  return (
    <td
      className={`
        ${
          sticky
            ? `${tableStyles.stickyCell} ${isEven ? tableStyles.stickyEvenCell : tableStyles.stickyOddCell}`
            : tableStyles.cell
        }
        ${className}
      `}
    >
      {children}
    </td>
  );
};

export default TableCell;
