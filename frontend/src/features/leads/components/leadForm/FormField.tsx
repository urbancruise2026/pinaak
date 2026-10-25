import React from "react";
import { Info, LucideIcon } from "lucide-react";

// Shared class names so every input looks the same
export const inputClass =
  "w-full py-2 pl-10 pr-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow";
export const labelClass = "block mb-1 text-md font-extrabold text-gray-700";
export const statInputClass  =
  "w-full text-white font-extrabold text-2xl py-2 text-center border border-gray-300 rounded-md placeholder:text-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500";

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  info?: boolean;
  className?: string;
  children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  icon: Icon,
  iconClassName = "text-blue-600",
  info,
  className = "w-full",
  children,
}) => (
  <div className={className}>
    {label && (
      <label className={labelClass}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative group">
      {info && (
        <Info
          size={15}
          className="absolute -top-6 right-0 text-blue-500 cursor-help"
        />
      )}
      {children}
      {Icon && (
        <Icon
          className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${iconClassName}`}
          size={20}
        />
      )}
    </div>
    {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
  </div>
);

export default FormField;