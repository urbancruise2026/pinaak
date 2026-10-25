"use client";

import React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Globe,
  Calendar,
  Heart,
  Users,
  FileText,
  Home,
  CreditCard,
  Hash,
  BadgeCheck,
} from "lucide-react";

interface CustomerModelViewProps {
  customerData?: any;
}

const CustomerModelView: React.FC<CustomerModelViewProps> = ({
  customerData,
}) => {
  const fullName = [
    customerData?.firstName,
    customerData?.middleName,
    customerData?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const initials =
    [customerData?.firstName?.charAt(0), customerData?.lastName?.charAt(0)]
      .filter(Boolean)
      .join("")
      .toUpperCase() ||
    customerData?.customerName?.charAt(0)?.toUpperCase() ||
    "C";

  const customerFields = [
    {
      section: "Personal Information",
      icon: <User className="text-blue-950" size={20} />,
      fields: [
        {
          label: "Full Name",
          value: fullName || "—",
          icon: <User size={16} />,
        },
        {
          label: "First Name",
          value: customerData?.firstName || "—",
          icon: <User size={16} />,
        },
        {
          label: "Middle Name",
          value: customerData?.middleName || "—",
          icon: <User size={16} />,
        },
        {
          label: "Last Name",
          value: customerData?.lastName || "—",
          icon: <User size={16} />,
        },
        {
          label: "Email",
          value: customerData?.customerEmail || "—",
          icon: <Mail size={16} />,
        },
        {
          label: "Phone Number",
          value: customerData?.customerPhone || "—",
          icon: <Phone size={16} />,
        },
        {
          label: "Alternate Phone",
          value: customerData?.alternatePhone || "—",
          icon: <Phone size={16} />,
        },
        {
          label: "Date of Birth",
          value: formatDate(customerData?.date_of_birth),
          icon: <Calendar size={16} />,
        },
        {
          label: "Anniversary",
          value: formatDate(customerData?.anniversary),
          icon: <Heart size={16} />,
        },
        {
          label: "Gender",
          value: customerData?.gender || "—",
          icon: <Users size={16} />,
        },
      ],
    },
    {
      section: "Company & Customer Type",
      icon: <Building className="text-blue-950" size={20} />,
      fields: [
        {
          label: "Company Name",
          value: customerData?.companyName || "—",
          icon: <Building size={16} />,
        },
        {
          label: "Customer Category",
          value: customerData?.customerType || "—",
          icon: <Users size={16} />,
        },
        {
          label: "Customer Type",
          value: customerData?.customerCategoryType || "—",
          icon: <FileText size={16} />,
        },
      ],
    },
    {
      section: "Address Information",
      icon: <Home className="text-blue-950" size={20} />,
      fields: [
        {
          label: "Address",
          value: customerData?.address || customerData?.customerAddress || "—",
          icon: <MapPin size={16} />,
        },
        {
          label: "City",
          value: customerData?.customerCity || customerData?.city || "—",
          icon: <MapPin size={16} />,
        },
        {
          label: "State",
          value: customerData?.state || "—",
          icon: <MapPin size={16} />,
        },
        {
          label: "Country",
          value: customerData?.countryName || "—",
          icon: <Globe size={16} />,
        },
        {
          label: "Pincode",
          value: customerData?.pincode || "—",
          icon: <Hash size={16} />,
        },
      ],
    },
    {
      section: "Tax & Identification",
      icon: <CreditCard className="text-blue-950" size={20} />,
      fields: [
        {
          label: "GST Number",
          value: customerData?.gstNumber || "—",
          icon: <FileText size={16} />,
        },
        {
          label: "PAN Number",
          value: customerData?.panNumber || "—",
          icon: <CreditCard size={16} />,
        },
      ],
    },
  ];

  if (!customerData) {
    return (
      <div className="bg-slate-50 rounded-2xl p-12 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-950 mb-4" />
          <p className="text-slate-600 text-lg font-medium">
            Loading customer details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="space-y-6">
        {/* ── CUSTOMER HEADER CARD ── */}
        <div className="relative rounded-2xl overflow-hidden shadow-md">
          {/* Background: deep blue with subtle dot pattern */}
          <div className="absolute inset-0 bg-red-950" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle, #ffffff 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          {/* Soft glow blob top-right */}
          <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-blue-700 opacity-20 blur-3xl" />

          {/* Content */}
          <div className="relative z-10 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="h-20 w-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-bold text-white uppercase tracking-wide select-none">
                  {initials}
                </div>
                {/* online dot */}
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-blue-950" />
              </div>

              {/* Name + contact */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-white leading-tight truncate">
                    {fullName || customerData?.customerName || "Customer Name"}
                  </h3>
                  {customerData?.customerType && (
                    <span className="inline-flex items-center gap-1 bg-white/15 border border-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
                      <BadgeCheck size={12} className="text-emerald-300" />
                      {customerData.customerType}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-2">
                  {customerData?.customerEmail && (
                    <p className="flex items-center gap-1.5 text-blue-200 text-sm">
                      <Mail size={13} className="text-blue-300 flex-shrink-0" />
                      <span className="truncate">
                        {customerData.customerEmail}
                      </span>
                    </p>
                  )}
                  {customerData?.customerPhone && (
                    <p className="flex items-center gap-1.5 text-blue-200 text-sm">
                      <Phone
                        size={13}
                        className="text-blue-300 flex-shrink-0"
                      />
                      {customerData.customerPhone}
                    </p>
                  )}
                  {(customerData?.customerCity || customerData?.city) && (
                    <p className="flex items-center gap-1.5 text-blue-200 text-sm">
                      <MapPin
                        size={13}
                        className="text-blue-300 flex-shrink-0"
                      />
                      {customerData.customerCity || customerData.city}
                      {customerData?.state ? `, ${customerData.state}` : ""}
                    </p>
                  )}
                  {customerData?.companyName && (
                    <p className="flex items-center gap-1.5 text-blue-200 text-sm">
                      <Building
                        size={13}
                        className="text-blue-300 flex-shrink-0"
                      />
                      {customerData.companyName}
                    </p>
                  )}
                </div>
              </div>

              {/* Right-side quick stats */}
              <div className="flex sm:flex-col gap-3 sm:gap-2 flex-shrink-0">
                {customerData?.gstNumber && (
                  <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2 text-center">
                    <p className="text-blue-300 text-[10px] uppercase tracking-widest font-semibold mb-0.5">
                      GST
                    </p>
                    <p className="text-white text-xs font-mono font-medium">
                      {customerData.gstNumber}
                    </p>
                  </div>
                )}
                {customerData?.panNumber && (
                  <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2 text-center">
                    <p className="text-blue-300 text-[10px] uppercase tracking-widest font-semibold mb-0.5">
                      PAN
                    </p>
                    <p className="text-white text-xs font-mono font-medium">
                      {customerData.panNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* ── END HEADER ── */}

        {/* Section Cards */}
        {customerFields.map((section, sectionIdx) => (
          <div
            key={sectionIdx}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
          >
            {/* Section Header */}
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
              <div className="flex items-center gap-2">
                {section.icon}
                <h3 className="text-lg font-semibold text-blue-950">
                  {section.section}
                </h3>
              </div>
            </div>

            {/* Section Fields */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {section.fields.map((field, fieldIdx) => (
                  <div
                    key={fieldIdx}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="text-slate-400 mt-0.5">{field.icon}</div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-sm font-bold text-black uppercase tracking-wider mb-1">
                        {field.label}
                      </label>
                      <div className="text-slate-800 font-medium text-md break-words">
                        {field.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* System Information */}
        {(customerData?.createdAt || customerData?.updatedAt) && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-blue-50 px-6 py-4 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <FileText className="text-blue-950" size={20} />
                <h3 className="text-lg font-semibold text-blue-950">
                  System Information
                </h3>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customerData?.createdAt && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="text-slate-400">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Created At
                      </label>
                      <div className="text-slate-800 font-medium">
                        {new Date(customerData.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
                {customerData?.updatedAt && (
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="text-slate-400">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Last Updated
                      </label>
                      <div className="text-slate-800 font-medium">
                        {new Date(customerData.updatedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerModelView;
