import React from "react";
import {
  User,
  Phone,
  FileText,
  Calendar,
  Info,
} from "lucide-react";

// Props Types
interface DisabledFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  showInfo?: boolean;
  infoText?: string;
  icon?: React.ReactNode;
  className?: string;
}

interface DisabledDateFieldProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  required?: boolean;
}

interface DisabledTextFieldProps {
  label: string;
  value: string | number;
  placeholder?: string;
  icon?: React.ReactNode;
  required?: boolean;
  maxLength?: number;
}

interface DisabledSelectFieldProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  icon?: React.ReactNode;
  required?: boolean;
  placeholder?: string;
}

interface DisabledPhoneFieldProps {
  label: string;
  countryCode: string;
  phoneNumber: string;
  icon?: React.ReactNode;
  required?: boolean;
}

// Main Disabled Field Wrapper
export const DisabledField: React.FC<DisabledFieldProps> = ({
  label,
  children,
  required = false,
  showInfo = true,
  infoText = "This field cannot be edited",
  icon,
  className = "",
}) => {
  return (
    <div className={className}>
      <label className="block text-md font-extrabold text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative group">
        {showInfo && (
          <span title={infoText}>
            <Info
              size={15}
              className="absolute -top-4 right-0 text-blue-500 cursor-help z-10"
            />
          </span>
        )}
        <div className="relative">
          {children}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-20">
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Disabled Date Field
export const DisabledDateField: React.FC<DisabledDateFieldProps> = ({
  label,
  value,
  icon,
  required = false,
}) => {
  return (
    <DisabledField label={label} required={required} icon={icon}>
      <input
        type="datetime-local"
        value={value}
        disabled
        className="w-full py-2 border bg-gray-100 px-12 border-gray-300 rounded-md cursor-not-allowed opacity-70 focus:outline-none"
      />
    </DisabledField>
  );
};

// Disabled Text Field
export const DisabledTextField: React.FC<DisabledTextFieldProps> = ({
  label,
  value,
  placeholder = "",
  icon,
  required = false,
  maxLength,
}) => {
  return (
    <DisabledField label={label} required={required} icon={icon}>
      <input
        value={value}
        disabled
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full py-2 border bg-gray-100 px-12 border-gray-300 rounded-md cursor-not-allowed opacity-70 focus:outline-none"
      />
    </DisabledField>
  );
};

// Disabled Select Field
export const DisabledSelectField: React.FC<DisabledSelectFieldProps> = ({
  label,
  value,
  options,
  icon,
  required = false,
  placeholder = "Select option",
}) => {
  return (
    <DisabledField label={label} required={required} icon={icon}>
      <select
        value={value}
        disabled
        className="w-full py-2 border bg-gray-100 px-12 border-gray-300 rounded-md cursor-not-allowed opacity-70 focus:outline-none appearance-none"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </DisabledField>
  );
};

// Disabled Phone Field
export const DisabledPhoneField: React.FC<DisabledPhoneFieldProps> = ({
  label,
  countryCode,
  phoneNumber,
  icon,
  required = false,
}) => {
  return (
    <DisabledField label={label} required={required} icon={icon}>
      <div className="relative flex items-center border border-gray-300 rounded-md overflow-hidden bg-gray-100 opacity-70">
        <div className="bg-gray-200 px-2 py-2 text-sm font-medium min-w-[100px] border-r border-gray-300">
          {countryCode}
        </div>
        <input
          value={phoneNumber}
          disabled
          placeholder="Enter phone number"
          className="w-full py-2 px-3 outline-none bg-gray-100 cursor-not-allowed"
        />
      </div>
    </DisabledField>
  );
};

// Disabled Textarea Field
export const DisabledTextareaField: React.FC<DisabledTextFieldProps> = ({
  label,
  value,
  placeholder = "",
  icon,
  required = false,
}) => {
  return (
    <DisabledField label={label} required={required} icon={icon}>
      <textarea
        value={value}
        disabled
        placeholder={placeholder}
        rows={4}
        className="w-full py-2 border bg-gray-100 px-12 border-gray-300 rounded-md cursor-not-allowed opacity-70 focus:outline-none resize-none"
      />
    </DisabledField>
  );
};

// Option Constants
export const SOURCE_OPTIONS = [
  { value: "Call", label: "Call" },
  { value: "WA", label: "WA" },
  { value: "GAC", label: "GAC" },
  { value: "GAQ", label: "GAQ" },
  { value: "Email", label: "Email" },
  { value: "META", label: "META" },
  { value: "GA", label: "GA" },
  { value: "REP-C", label: "REP-C" },
  { value: "REF-C", label: "REF-C" },
];

export const CUSTOMER_CATEGORY_OPTIONS = [
  { value: "Personal", label: "Personal" },
  { value: "Corporate", label: "Corporate" },
  { value: "Travel Agent", label: "Agent" },
];

export const CITY_OPTIONS = [
  { value: "delhi", label: "Delhi" },
  { value: "gurgoan", label: "Gurgoan" },
  { value: "hydrabad", label: "Hydrabad" },
  { value: "noida", label: "Noida" },
];