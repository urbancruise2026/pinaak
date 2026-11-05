"use client";

import React from "react";
import { tableStyles } from "./tableStyles";

interface TableProps {
  children: React.ReactNode;
  minWidth?: string;
  className?: string;
}

const Table: React.FC<TableProps> = ({
  children,
  minWidth = "min-w-[1000px]",
  className = "",
}) => (
  <div className={`${tableStyles.wrapper} ${className}`}>
    <div className={tableStyles.scroll}>
      <table className={`${minWidth} w-full border-collapse`}>{children}</table>
    </div>
  </div>
);

export default Table;