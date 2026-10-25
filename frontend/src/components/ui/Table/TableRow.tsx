"use client";

import React from "react";
import { tableStyles } from "./tableStyles";

interface TableRowProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
  alternate?: boolean;
  header?: boolean;
}
const TableRow: React.FC<TableRowProps> = ({
  children,
  index = 0,
  className = "",
  alternate = true,
  header = false,
}) => {
  if (header) {
    return (
      <tr className={`${tableStyles.headerRow} ${className}`}>{children}</tr>
    );
  }
  const rowColor =
    alternate && index % 2 !== 0 ? tableStyles.oddRow : tableStyles.evenRow;
  return (
    <tr className={`${tableStyles.row} ${rowColor} ${className}`}>
      {children}
    </tr>
  );
};

export default TableRow;
