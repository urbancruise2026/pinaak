"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface CustomerSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  showDropdown: boolean;
  setShowDropdown: (value: boolean) => void;
  onSelect: (customer: any) => void;
  onClear: () => void;
}

const CustomerSearch: React.FC<CustomerSearchProps> = ({
  searchTerm,
  setSearchTerm,
  showDropdown,
  setShowDropdown,
  onSelect,
  onClear,
}) => {
  const { searchResults, searching, searchError } = useSelector(
    (state: RootState) => state.newCustomer,
  );

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search customers by name, email or phone..."
        className="pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-80 bg-white"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
      />
      <svg
        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {searchTerm && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {searching && (
        <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50 p-4 text-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600 mx-auto"></div>
          <span className="text-sm text-gray-500 ml-2">Searching...</span>
        </div>
      )}

      {showDropdown && !searching && searchResults.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {searchResults.map((customer) => (
            <div
              key={customer.uuid}
              className="p-3 hover:bg-gray-100 cursor-pointer border-b transition-colors"
              onMouseDown={() => onSelect(customer)}
            >
              <div className="font-semibold text-gray-800">
                {customer.customerName}
              </div>
              <div className="text-sm text-gray-600">
                {customer.customerEmail && (
                  <span>{customer.customerEmail} | </span>
                )}
                {customer.customerPhone}
              </div>
              {customer.companyName && (
                <div className="text-xs text-gray-500 mt-1">
                  {customer.companyName}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showDropdown &&
        !searching &&
        searchTerm.length >= 2 &&
        searchResults.length === 0 &&
        !searchError && (
          <div className="absolute top-full mt-2 w-full bg-white border rounded-lg shadow-lg z-50 p-4 text-center text-gray-500">
            No customers found for "{searchTerm}"
          </div>
        )}

      {searchError && (
        <div className="absolute top-full mt-2 w-full bg-red-50 border border-red-200 rounded-lg shadow-lg z-50 p-3 text-center">
          <p className="text-red-600 text-sm">{searchError}</p>
          <button
            type="button"
            onClick={onClear}
            className="mt-2 text-sm text-red-700 hover:text-red-900"
          >
            Clear and try again
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;