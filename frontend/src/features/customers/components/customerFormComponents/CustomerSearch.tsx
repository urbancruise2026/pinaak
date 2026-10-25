"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, X } from "lucide-react";
import type { AppDispatch, RootState } from "@/store/store";
import {
  searchCustomersThunk,
  clearSearchResults,
} from "@/features/customers/newCustomerSlice";
import type { SectionTheme } from "./types";

interface Props {
  theme: SectionTheme;
  onSelect: (customer: any) => void;
}

/** Existing customer search (sirf create mode me dikhta hai). Apni state khud sambhalta hai. */
const CustomerSearch: React.FC<Props> = ({ theme, onSelect }) => {
  const dispatch = useDispatch<AppDispatch>();
  const searchResults: any[] =
    useSelector((s: RootState) => s.newCustomer?.searchResults) || [];

  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  const search = async () => {
    const q = term.trim();
    if (!q) return setOpen(false);

    try {
      setSearching(true);
      dispatch(clearSearchResults());
      const result: any = await dispatch(searchCustomersThunk(q)).unwrap();
      const list = Array.isArray(result) ? result : result?.data || [];
      setOpen(Array.isArray(list) && list.length > 0);
    } catch (err) {
      console.error("Search error:", err);
      setOpen(false);
    } finally {
      setSearching(false);
    }
  };

  const clear = () => {
    setTerm("");
    setOpen(false);
    dispatch(clearSearchResults());
  };

  const select = (customer: any) => {
    onSelect(customer);
    clear();
  };

  const dropdown = "absolute z-50 w-full mt-2 bg-white border rounded-lg shadow-lg top-full";

  return (
    <div className="relative w-full lg:w-96">
      <Search
        size={18}
        className={`absolute -translate-y-1/2 pointer-events-none left-3 top-1/2 ${theme.icon}`}
      />
      <input
        type="text"
        placeholder="Search customers by name, email or phone..."
        className={`w-full py-2 pl-10 pr-24 text-sm bg-white border rounded-lg outline-none ${theme.field}`}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onFocus={() => searchResults.length > 0 && setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            search();
          }
        }}
        onBlur={() => setTimeout(() => setOpen(false), 200)}
      />

      {term && (
        <>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={search}
            className="absolute text-sm font-semibold -translate-y-1/2 right-9 top-1/2 text-violet-600 hover:text-violet-800"
          >
            Search
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clear}
            className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </>
      )}

      {searching && (
        <div className={`${dropdown} p-4 text-center`}>
          <div className="w-5 h-5 mx-auto border-b-2 rounded-full animate-spin border-violet-600" />
        </div>
      )}

      {open && !searching && searchResults.length > 0 && (
        <div className={`${dropdown} overflow-y-auto max-h-80`}>
          {searchResults.map((c, i) => (
            <div
              key={c.uuid || c.id || i}
              className="p-3 border-b cursor-pointer hover:bg-violet-50 last:border-b-0"
              onMouseDown={() => select(c)}
            >
              <div className="font-semibold text-gray-800">
                {c.firstName || c.customerName || ""} {c.lastName || ""}
              </div>
              <div className="text-sm text-gray-600">
                {c.customerEmail && <span>{c.customerEmail} | </span>}
                {c.customerPhone || ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {open && !searching && term.trim() && searchResults.length === 0 && (
        <div className={`${dropdown} p-4 text-sm text-center text-gray-500`}>
          No customer found
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;
