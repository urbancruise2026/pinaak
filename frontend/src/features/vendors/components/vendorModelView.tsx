"use client";

import React, { useEffect, useRef } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Building,
  CreditCard,
  Landmark,
  Hash,
  BadgeCheck,
} from "lucide-react";

interface VendorModalViewProps {
  vendor: any;
  onClose: () => void;
}

const VendorModalView: React.FC<VendorModalViewProps> = ({
  vendor,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const get = (v: any, ...keys: string[]): string => {
    for (const k of keys) {
      const parts = k.split(".");
      let val: any = v;
      for (const p of parts) val = val?.[p];
      if (val !== undefined && val !== null && val !== "") return String(val);
    }
    return "";
  };

  const vendorName = get(vendor, "name", "vendor_name", "vendorName");
  const email = get(vendor, "email", "vendor_email");
  const phone = get(vendor, "phone", "mobile", "vendor_phone");
  const companyName = get(vendor, "company_name", "companyName", "company.name");
  const companyType = get(vendor, "companyType", "company_type", "company.type");
  const gstNumber = get(vendor, "gstNumber", "gst_number", "gst");
  const ownerName = get(vendor, "ownerName", "owner_name", "owner.name");
  const city = get(vendor, "personalInfo.personalCity", "personal_city", "city", "address.city");
  const state = get(vendor, "personalInfo.personalState", "personal_state", "state", "address.state");
  const pincode = get(vendor, "personalInfo.personalPincode", "pincode", "address.pincode");
  const address = get(vendor, "personalInfo.personalAddress", "address_line", "address");
  const panNumber = get(vendor, "panNumber", "pan_number", "pan");
  const bankName = get(vendor, "bankName", "bank_name", "bank.name");
  const accountNo = get(vendor, "accountNumber", "account_number", "bank.accountNumber");
  const ifsc = get(vendor, "ifscCode", "ifsc_code", "bank.ifsc");
  const status = get(vendor, "status") || "active";
  const vendorId = get(vendor, "id", "vendor_id");

  const isActive = status !== "inactive";

  // ── Driver-modal style: light bg + dark text field row ──
  const InfoRow = ({
    label,
    value,
    icon: Icon,
    iconColor = "blue",
  }: {
    label: string;
    value: string;
    icon?: any;
    iconColor?: string;
  }) => {
    const colorMap: Record<string, string> = {
      blue: "text-blue-500",
      green: "text-green-500",
      purple: "text-purple-500",
      yellow: "text-yellow-500",
      orange: "text-orange-500",
    };
    return (
      <div className="flex items-start gap-3 p-3 border-b border-gray-100 last:border-0">
        {Icon && (
          <div className="flex-shrink-0 mt-0.5">
            <Icon className={`w-4 h-4 ${colorMap[iconColor] ?? "text-blue-500"}`} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            {label}
          </p>
          <p className="text-sm text-gray-800 font-medium mt-0.5 break-words">
            {value || "—"}
          </p>
        </div>
      </div>
    );
  };

  // ── Section header (same driver-modal style) ──
  const SectionHeader = ({
    title,
    icon: Icon,
    color,
  }: {
    title: string;
    icon: any;
    color: "blue" | "green" | "purple" | "yellow";
  }) => {
    const map = {
      blue:   { border: "border-blue-200",   text: "text-blue-700",   icon: "text-blue-600"   },
      green:  { border: "border-green-200",  text: "text-green-700",  icon: "text-green-600"  },
      purple: { border: "border-purple-200", text: "text-purple-700", icon: "text-purple-600" },
      yellow: { border: "border-yellow-200", text: "text-yellow-700", icon: "text-yellow-600" },
    };
    const c = map[color];
    return (
      <div className={`flex items-center gap-2 mb-4 pb-2 border-b-2 ${c.border}`}>
        <Icon className={`w-5 h-5 ${c.icon}`} />
        <h3 className={`text-base font-semibold ${c.text}`}>{title}</h3>
      </div>
    );
  };

  const hasBankInfo = bankName || accountNo || ifsc;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-modal-in"
      >
        {/* ── HEADER ── */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-5 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white text-xl font-bold shadow-inner">
              {vendorName ? vendorName.charAt(0).toUpperCase() : "V"}
            </div>
            <div>
              <h2 className="text-white text-lg font-bold leading-tight">
                {vendorName || "—"}
              </h2>
              <p className="text-orange-100 text-xs mt-0.5">Vendor ID: #{vendorId || "—"}</p>
              <span
                className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                  isActive
                    ? "bg-green-400/30 text-green-100"
                    : "bg-red-400/30 text-red-100"
                }`}
              >
                {isActive ? "● Active" : "● Inactive"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-1.5 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── BODY ── */}
        <div className="overflow-y-auto px-6 py-5 flex-1 space-y-5">

          {/* Basic Information — Blue */}
          <div className="bg-blue-50 rounded-lg p-4">
            <SectionHeader title="Basic Information" icon={User} color="blue" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
              <InfoRow label="Vendor Name"  value={vendorName}  icon={User}       iconColor="blue" />
              <InfoRow label="Owner Name"   value={ownerName}   icon={User}       iconColor="blue" />
              <InfoRow label="Email"        value={email}       icon={Mail}       iconColor="blue" />
              <InfoRow label="Phone"        value={phone}       icon={Phone}      iconColor="blue" />
              <InfoRow label="PAN Number"   value={panNumber}   icon={CreditCard} iconColor="blue" />
            </div>
          </div>

          {/* Company Details — Purple */}
          <div className="bg-purple-50 rounded-lg p-4">
            <SectionHeader title="Company Details" icon={Building} color="purple" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
              <InfoRow label="Company Name" value={companyName} icon={Building}    iconColor="purple" />
              <InfoRow label="Company Type" value={companyType} icon={BadgeCheck}  iconColor="purple" />
              <InfoRow label="GST Number"   value={gstNumber}   icon={Hash}        iconColor="purple" />
            </div>
          </div>

          {/* Address — Green */}
          <div className="bg-green-50 rounded-lg p-4">
            <SectionHeader title="Address" icon={MapPin} color="green" />
            <div className="grid grid-cols-1 gap-1">
              <InfoRow label="Address" value={address} icon={MapPin} iconColor="green" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1">
                <InfoRow label="City"    value={city}    icon={MapPin} iconColor="green" />
                <InfoRow label="State"   value={state}   icon={MapPin} iconColor="green" />
                <InfoRow label="Pincode" value={pincode} icon={MapPin} iconColor="green" />
              </div>
            </div>
          </div>

          {/* Bank Details — Yellow */}
          {hasBankInfo && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <SectionHeader title="Bank Details" icon={Landmark} color="yellow" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                <InfoRow label="Bank Name"       value={bankName}  icon={Landmark}  iconColor="yellow" />
                <InfoRow label="Account Number"  value={accountNo} icon={FileText}  iconColor="yellow" />
                <InfoRow label="IFSC Code"       value={ifsc}      icon={Hash}      iconColor="yellow" />
              </div>
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="shrink-0 border-t border-gray-100 px-6 py-3 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .animate-modal-in {
          animation: modalIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default VendorModalView;