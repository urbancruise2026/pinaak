"use client";

import React from "react";
import { tableStyles } from "./tableStyles";

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}
const TableHeader: React.FC<TableHeaderProps> = ({
  children,
  className = "",
}) => {
  return (
    <thead className={`${tableStyles.header} ${className}`}>{children}</thead>
  );
};

export default TableHeader;
