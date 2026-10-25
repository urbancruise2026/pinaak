"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import type { LeadFormData } from "./schema";

interface SubmitSectionProps {
  isSubmitting: boolean;
  hasUser: boolean;
}

const SubmitSection: React.FC<SubmitSectionProps> = ({
  isSubmitting,
  hasUser,
}) => {
  const {
    formState: { errors, isValid },
  } = useFormContext<LeadFormData>();

  const disabled = isSubmitting || !hasUser;

  return (
    <div className="pt-6">
      {!isValid && Object.keys(errors).length > 0 && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <p className="font-semibold mb-2">Please fix the following errors:</p>
          <ul className="list-disc list-inside text-sm">
            {Object.entries(errors)
              .slice(0, 5)
              .map(([key, error]: any) => (
                <li key={key}>
                  <span className="font-semibold">{key}</span>:{" "}
                  {error?.message || "is invalid"}
                </li>
              ))}
          </ul>
        </div>
      )}

      {!hasUser && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-300 text-amber-700 rounded-md text-sm">
          ⚠ Loading user session... Please wait before submitting.
        </div>
      )}

      <button
        type="submit"
        disabled={disabled}
        className={`w-full px-6 py-3 font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
          disabled
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-900 text-white hover:bg-blue-500"
        }`}
      >
        {isSubmitting ? "Submitting..." : !hasUser ? "Loading user..." : "Submit"}
      </button>
    </div>
  );
};

export default SubmitSection;