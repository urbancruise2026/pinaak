"use client";

import React from "react";
import { tableStyles } from "./tableStyles";

interface TableProps {
  children: React.ReactNode;
  minWidth?: string;
  maxHeight?: string;
  className?: string;
}
const Table: React.FC<TableProps> = ({
  children,
  minWidth = "min-w-[1000px]",
  maxHeight = "max-h-[700px]",
  className = "",
}) => {
  return (
    <div className={`${tableStyles.wrapper} ${className}`}>
      <div className={tableStyles.scroll}>
        <div
          className={`
            ${maxHeight}
            overflow-y-auto
            overscroll-contain
          `}
        >
          <table
            className={`
              ${minWidth}
              w-full
              border-collapse
            `}
          >
            {children}
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;
