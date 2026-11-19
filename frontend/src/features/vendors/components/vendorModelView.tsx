"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  User,
  UserRound,
  Mail,
  Phone,
  IdCard,
  Building2,
  Briefcase,
  Hash,
  MapPin,
  Home,
  Landmark,
  Warehouse,
  Tag,
  Users,
  FileText,
  CalendarDays,
  Truck,
  ExternalLink,
  Loader2,
  Globe2,
  CreditCard,
  Wallet,
} from "lucide-react";
import { getVendorByIdAPI } from "@/features/vendors/vendorApi";

interface Props {
  vendor: any;
  onClose: () => void;
}

const txt = (v: unknown) =>
  v === null || v === undefined || String(v).trim() === ""
    ? "—"
    : String(v).trim();

const fmtDate = (v: unknown) => {
  if (!v) return "—";
  const d = new Date(String(v));
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

const isImage = (url: string) => /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(url);

// har key backend ke getVendorByIdModel ke docs se match karti hai
const DOCS: { key: string; label: string }[] = [
  { key: "vendorProof", label: "Office Photo (Outside)" },
  { key: "vendorProof2", label: "Office Photo (Inside)" },
  { key: "panDoc", label: "PAN Card (company)" },
  { key: "gstDoc", label: "GST Document" },
  { key: "adharDoc", label: "Aadhaar Card (Owner)" },
  { key: "passportPhoto", label: "Passport size Photo" },
  { key: "vehicleDoc", label: "Vehicle Document" },
];

/* ---------- Status config (table ke saath same) ---------- */
const STATUS_STYLES: Record<
  string,
  { label: string; cls: string; dot: string }
> = {
  applied: {
    label: "Applied",
    cls: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  approved: {
    label: "Approved",
    cls: "bg-teal-100 text-teal-700",
    dot: "bg-teal-500",
  },
  rejected: {
    label: "Rejected",
    cls: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
  active: {
    label: "Active",
    cls: "bg-green-100 text-green-700",
    dot: "bg-green-500",
  },
  inactive: {
    label: "Inactive",
    cls: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
  suspended: {
    label: "Suspended",
    cls: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  blocked: {
    label: "Blocked",
    cls: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
};

const Field = ({
  label,
  value,
  Icon,
  iconClass,
  badge,
}: {
  label: string;
  value: string;
  Icon: React.ElementType;
  iconClass: string;
  badge?: string;
}) => (
  <div className="flex items-center gap-3">
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClass}`}
    >
      <Icon size={20} />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-slate-500">{label}</p>
      {badge && value !== "—" ? (
        <span
          className={`mt-0.5 inline-flex rounded-full px-3 py-0.5 text-sm font-semibold ${badge}`}
        >
          {value}
        </span>
      ) : (
        <p className="break-words text-base font-semibold text-slate-900">
          {value}
        </p>
      )}
    </div>
  </div>
);

const Section = ({
  title,
  Icon,
  wrap,
  head,
  children,
}: {
  title: string;
  Icon: React.ElementType;
  wrap: string;
  head: string;
  children: React.ReactNode;
}) => (
  <div className={`overflow-hidden rounded-xl border ${wrap}`}>
    <div className={`flex items-center gap-2.5 border-b px-5 py-3 ${head}`}>
      <Icon size={20} />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="px-5 py-5">{children}</div>
  </div>
);

// ek company / ek garage ka card (multiple items ke liye)
const ItemCard = ({
  title,
  border,
  children,
}: {
  title: string;
  border: string;
  children: React.ReactNode;
}) => (
  <div className={`rounded-xl border bg-white p-4 ${border}`}>
    <p className="mb-4 text-base font-semibold text-slate-800">{title}</p>
    {children}
  </div>
);

const GRID = "grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3";

const VendorModalView: React.FC<Props> = ({ vendor: initial, onClose }) => {
  const [data, setData] = useState<any>(initial);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // backend se poora vendor fetch karo
  useEffect(() => {
    const id = Number(initial?.id ?? initial?.vendor_id);
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const full = await getVendorByIdAPI(id);
        if (!cancelled && full) setData({ ...initial, ...full });
      } catch (err: any) {
        if (!cancelled) setFetchError(err?.message || "Failed to load vendor");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initial]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!data) return null;

  const name = txt(data.name);
  const avatar = name !== "—" ? name.charAt(0).toUpperCase() : "V";

  const statusKey = txt(data.status).toLowerCase();
  const status = STATUS_STYLES[statusKey] ?? STATUS_STYLES.applied;

  const verified = txt(data.verification).toLowerCase() === "verified";
  const verificationRejected =
    txt(data.verification).toLowerCase() === "rejected";
  const verificationLabel = verified
    ? "Verified"
    : verificationRejected
      ? "Verification rejected"
      : "Verification pending";
  const verificationCls = verified
    ? "bg-blue-100 text-blue-700"
    : verificationRejected
      ? "bg-rose-100 text-rose-700"
      : "bg-amber-100 text-amber-700";

  const blue = "bg-blue-100 text-blue-600";
  const purple = "bg-purple-100 text-purple-600";
  const indigo = "bg-indigo-100 text-indigo-600";
  const green = "bg-green-100 text-green-600";
  const rose = "bg-rose-100 text-rose-600";
  const amber = "bg-amber-100 text-amber-600";

  const contacts = [
    {
      title: "Owner",
      name: data.ownerName,
      phone: data.ownerPhone,
      email: data.ownerEmail,
    },
    {
      title: "Ops Manager",
      name: data.managerName1,
      phone: data.managerPhone1,
      email: data.managerEmail1,
    },
    {
      title: "Accountant",
      name: data.managerName2,
      phone: data.managerPhone2,
      email: data.managerEmail2,
    },
  ];

  const companies: any[] = Array.isArray(data.companies) ? data.companies : [];
  const garages: any[] = Array.isArray(data.garages) ? data.garages : [];

  const uploadedDocs = DOCS.filter((d) => data[d.key]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ---------- Header ---------- */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl font-bold text-indigo-600">
              {avatar}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{name}</h2>
              <p className="text-base text-slate-500">
                Vendor ID: {txt(data.venderCode ?? data.vender_code ?? data.id)}
                {data.shortName ? ` · ${data.shortName}` : ""}
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-sm font-medium ${status.cls}`}
                >
                  <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
                <span
                  className={`inline-flex rounded-full px-3 py-0.5 text-sm font-medium ${verificationCls}`}
                >
                  {verificationLabel}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full bg-red-500 p-2 text-white transition hover:bg-red-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* ---------- Body ---------- */}
        <div className="relative space-y-4 overflow-y-auto bg-slate-50/40 px-6 py-5">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" /> Loading full
              details...
            </div>
          )}
          {fetchError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {fetchError}
            </div>
          )}

          {/* Basic Information */}
          <Section
            title="Basic Information"
            Icon={User}
            wrap="border-blue-200 bg-blue-50/40"
            head="border-blue-200 bg-blue-50 text-blue-900"
          >
            <div className={GRID}>
              <Field
                label="Vendor Name"
                value={name}
                Icon={UserRound}
                iconClass={blue}
              />
              <Field
                label="Vendor Code"
                value={txt(data.venderCode ?? data.vender_code)}
                Icon={Hash}
                iconClass={blue}
              />
              <Field
                label="Short Name"
                value={txt(data.shortName)}
                Icon={Tag}
                iconClass={blue}
              />
              <Field
                label="Region"
                value={txt(data.region)}
                Icon={Globe2}
                iconClass={blue}
                badge="bg-blue-100 text-blue-800"
              />
              <Field
                label="Vendor Category"
                value={txt(data.vendorCategory)}
                Icon={Truck}
                iconClass={blue}
                badge="bg-indigo-100 text-indigo-800"
              />
            </div>
          </Section>

          {/* Contacts */}
          <Section
            title="Contact Information"
            Icon={Users}
            wrap="border-sky-200 bg-sky-50/40"
            head="border-sky-200 bg-sky-50 text-sky-900"
          >
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
              {contacts.map((c) => (
                <div key={c.title} className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
                    {c.title}
                  </p>
                  <Field
                    label="Name"
                    value={txt(c.name)}
                    Icon={User}
                    iconClass="bg-sky-100 text-sky-600"
                  />
                  <Field
                    label="Phone"
                    value={txt(c.phone)}
                    Icon={Phone}
                    iconClass="bg-sky-100 text-sky-600"
                  />
                  <Field
                    label="Email"
                    value={txt(c.email)}
                    Icon={Mail}
                    iconClass="bg-sky-100 text-sky-600"
                  />
                </div>
              ))}
            </div>
          </Section>

          {/* Companies (multiple) - har company ke saath uski bank details */}
          <Section
            title={`Company Details${companies.length ? ` (${companies.length})` : ""}`}
            Icon={Building2}
            wrap="border-purple-200 bg-purple-50/40"
            head="border-purple-200 bg-purple-50 text-purple-900"
          >
            {companies.length === 0 ? (
              <p className="text-base text-slate-500">
                No company details added.
              </p>
            ) : (
              <div className="space-y-5">
                {companies.map((c, i) => {
                  const cheque = c.cancelledCheque
                    ? String(c.cancelledCheque)
                    : "";
                  return (
                    <ItemCard
                      key={c.id ?? i}
                      title={`Company ${i + 1}: ${txt(c.companyName)}`}
                      border="border-purple-100"
                    >
                      <div className={GRID}>
                        <Field
                          label="Company Name"
                          value={txt(c.companyName)}
                          Icon={Building2}
                          iconClass={purple}
                        />
                        <Field
                          label="Company Type"
                          value={txt(c.companyType)}
                          Icon={Briefcase}
                          iconClass={purple}
                          badge="bg-purple-100 text-purple-800"
                        />
                        <Field
                          label="Company PAN"
                          value={txt(c.companyPanNumber)}
                          Icon={IdCard}
                          iconClass={purple}
                        />
                        <Field
                          label="Registration Number"
                          value={txt(c.companyRegisteredNumber)}
                          Icon={FileText}
                          iconClass={purple}
                        />
                        <Field
                          label="GST Number"
                          value={txt(c.gstNumber)}
                          Icon={Hash}
                          iconClass={purple}
                        />
                        <Field
                          label="Business Number"
                          value={txt(c.businessNumber)}
                          Icon={Hash}
                          iconClass={purple}
                        />
                        <Field
                          label="Fleet Details"
                          value={txt(c.cooperativeName)}
                          Icon={Truck}
                          iconClass={purple}
                        />
                        <Field
                          label="Cooperative Number"
                          value={txt(c.cooperativeNumber)}
                          Icon={Hash}
                          iconClass={purple}
                        />
                        <Field
                          label="Registered Address"
                          value={txt(c.registeredAddress)}
                          Icon={MapPin}
                          iconClass={purple}
                        />
                      </div>

                      {/* Bank details of this company */}
                      <div className="mt-5 border-t border-purple-100 pt-4">
                        <p className="mb-4 text-sm font-semibold text-rose-700">
                          Bank Details
                        </p>
                        <div className={GRID}>
                          <Field
                            label="Bank Name"
                            value={txt(c.bankName)}
                            Icon={Landmark}
                            iconClass={rose}
                          />
                          <Field
                            label="Account Number"
                            value={txt(c.bankAccountNumber)}
                            Icon={CreditCard}
                            iconClass={rose}
                          />
                          <Field
                            label="Account Holder Name"
                            value={txt(c.accountHolderName)}
                            Icon={UserRound}
                            iconClass={rose}
                          />
                          <Field
                            label="IFSC Code"
                            value={txt(c.ifscCode)}
                            Icon={Wallet}
                            iconClass={rose}
                          />
                        </div>

                        {cheque && (
                          <a
                            href={cheque}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                          >
                            <FileText size={16} />
                            View Cancelled Cheque
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </ItemCard>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Vendor address */}
          <Section
            title="Address"
            Icon={MapPin}
            wrap="border-green-200 bg-green-50/40"
            head="border-green-200 bg-green-50 text-green-900"
          >
            <div className={GRID}>
              <Field
                label="Vendor Address"
                value={txt(data.personalInfo?.personalAddress)}
                Icon={Home}
                iconClass={green}
              />
              <Field
                label="City"
                value={txt(data.personalInfo?.personalCity)}
                Icon={Building2}
                iconClass={green}
              />
              <Field
                label="State"
                value={txt(data.personalInfo?.personalState)}
                Icon={Landmark}
                iconClass={green}
              />
            </div>
          </Section>

          {/* Garages (multiple) */}
          <Section
            title={`Garages${garages.length ? ` (${garages.length})` : ""}`}
            Icon={Warehouse}
            wrap="border-teal-200 bg-teal-50/40"
            head="border-teal-200 bg-teal-50 text-teal-900"
          >
            {garages.length === 0 ? (
              <p className="text-base text-slate-500">No garages added.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {garages.map((g, i) => (
                  <ItemCard
                    key={g.id ?? i}
                    title={`Garage ${i + 1}`}
                    border="border-teal-100"
                  >
                    <div className="space-y-4">
                      <Field
                        label="Garage Address"
                        value={txt(g.garageAddress)}
                        Icon={MapPin}
                        iconClass="bg-teal-100 text-teal-600"
                      />
                      <Field
                        label="Garage Manager"
                        value={txt(g.garageManager)}
                        Icon={User}
                        iconClass="bg-teal-100 text-teal-600"
                      />
                      <Field
                        label="Garage Phone"
                        value={txt(g.garagePhone)}
                        Icon={Phone}
                        iconClass="bg-teal-100 text-teal-600"
                      />
                    </div>
                  </ItemCard>
                ))}
              </div>
            )}
          </Section>

          {/* Documents */}
          <Section
            title="Documents"
            Icon={FileText}
            wrap="border-amber-200 bg-amber-50/40"
            head="border-amber-200 bg-amber-50 text-amber-900"
          >
            {uploadedDocs.length === 0 ? (
              <p className="text-base text-slate-500">No documents uploaded.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {uploadedDocs.map(({ key, label }) => {
                  const url = String(data[key]);
                  return (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group overflow-hidden rounded-xl border border-amber-100 bg-white transition hover:shadow-md"
                    >
                      <div className="flex h-32 items-center justify-center bg-slate-100">
                        {isImage(url) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={url}
                            alt={label}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FileText size={40} className="text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between px-3 py-2.5">
                        <span className="text-base font-medium text-slate-800">
                          {label}
                        </span>
                        <ExternalLink
                          size={16}
                          className="text-slate-400 group-hover:text-amber-600"
                        />
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Record info */}
          <Section
            title="Record Info"
            Icon={CalendarDays}
            wrap="border-slate-200 bg-white"
            head="border-slate-200 bg-slate-50 text-slate-800"
          >
            <div className={GRID}>
              <Field
                label="Created At"
                value={fmtDate(data.createdAt)}
                Icon={CalendarDays}
                iconClass={amber}
              />
              <Field
                label="Last Updated"
                value={fmtDate(data.updatedAt)}
                Icon={CalendarDays}
                iconClass={amber}
              />
            </div>
          </Section>
        </div>

        {/* ---------- Footer ---------- */}
        <div className="flex justify-end border-t border-slate-200 bg-white px-6 py-4"></div>
      </div>
    </div>
  );
};

export default VendorModalView;
