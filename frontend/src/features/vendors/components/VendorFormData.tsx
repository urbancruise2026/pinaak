"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  User,
  UserRound,
  Building2,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Landmark,
  Lock,
  Tag,
  Home,
  Briefcase,
  Store,
  Contact,
  FileUp,
  FileText,
  Globe,
  Layers,
  Warehouse,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import FormPageHeader from "@/components/ui/PageHeader/FormPageHeader";
import { getRegionByStateIdThunk } from "@/features/vendors/vendorSlice";
import {
  Section,
  TextField,
  SelectField,
  FileField,
} from "./vendorComponents/FormParts";
import {
  THEMES as T,
  BANK_FIELDS,
  COMPANY_FIELDS,
  COMPANY_TYPES,
  CONTACT_FIELDS,
  DOC_FIELDS,
  MAX_LENGTHS,
  VENDOR_CATEGORIES,
  type FieldConfig,
} from "./vendorComponents/constants";
import MultiSelectField from "./vendorComponents/MultiSelectField";
import { useVendorForm } from "./vendorComponents/useVendorForm";
import type { FormMode, SectionTheme } from "./vendorComponents/types";

interface VendorFormProps {
  mode?: FormMode;
  onBack?: () => void;
  vendorId?: number;
}

const TITLES: Record<FormMode, string> = {
  create: "Vendor Registration Form",
  edit: "Edit Vendor",
  view: "View Vendor",
};

// Section ke upar right side me dikhne wala "Add ..." button
const AddButton = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <div className="flex justify-end col-span-full">
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition border rounded-lg border-emerald-300 text-emerald-700 hover:bg-emerald-50"
    >
      <Plus className="w-4 h-4" />
      {label}
    </button>
  </div>
);

const VendorForm: React.FC<VendorFormProps> = ({
  mode = "create",
  onBack,
  vendorId,
}) => {
  const f = useVendorForm({ mode, vendorId, onBack });
  const { formData, isView } = f;

  const dispatch = useDispatch<any>();
  const [regionLoading, setRegionLoading] = useState(false);

  // region field ki value set karne ke liye (form ke handleChange se)
  const setRegion = (value: string) =>
    f.handleChange({ target: { name: "region", value } } as any);

  // State badalne par uska region state id se auto-set hota hai
  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    f.handleChange(e as any); // personalInfo.personalState set

    const selected = f.states.find((s) => s.stateName === e.target.value);
    if (!selected) {
      setRegion("");
      return;
    }

    try {
      setRegionLoading(true);
      const result = await dispatch(
        getRegionByStateIdThunk(Number(selected.id)),
      ).unwrap();
      setRegion(result?.region?.name ?? ""); // region NULL ho to khali
    } catch (err) {
      console.error("Region fetch failed:", err);
      setRegion("");
    } finally {
      setRegionLoading(false);
    }
  };

  // contact section ke config-driven inputs (vendor level fields)
  const renderFields = (fields: FieldConfig[], theme: SectionTheme) =>
    fields.map(({ name, label, Icon, type = "text" }) => (
      <TextField
        key={name}
        label={label}
        Icon={Icon}
        theme={theme}
        viewMode={isView}
        name={name}
        type={type}
        value={formData[name] as string}
        onChange={f.handleChange}
        placeholder={`Enter ${label.toLowerCase()}`}
        inputMode={type === "tel" ? "numeric" : undefined}
        maxLength={MAX_LENGTHS[name as string]}
      />
    ));

  // document upload card (Documents section)
  const renderDocField = ({
    key,
    label,
    Icon,
    theme,
  }: {
    key: (typeof DOC_FIELDS)[number]["key"];
    label: string;
    Icon: (typeof DOC_FIELDS)[number]["Icon"];
    theme: SectionTheme;
  }) => {
    const selectedFile = f.files[key];
    const isBusy = !!f.uploading[key];
    const isUploaded = !!formData[key] && !isBusy;

    return (
      <div
        key={key}
        className={`rounded-lg p-2 transition ${
          isBusy
            ? "bg-amber-50 ring-2 ring-amber-300"
            : isUploaded
              ? "bg-green-50 ring-2 ring-green-400"
              : ""
        }`}
      >
        <FileField
          key={`${key}-${f.fileResetKey}`}
          label={label}
          Icon={Icon}
          theme={theme}
          viewMode={isView}
          file={selectedFile}
          currentUrl={formData[key]}
          onChange={f.handleFileChange(key)}
        />

        {isBusy && (
          <p className="mt-1 text-xs font-medium text-amber-600">
            Uploading...
          </p>
        )}

        {isUploaded && (
          <p className="flex items-center gap-1 mt-1 text-xs font-medium text-green-600">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {selectedFile ? selectedFile.name : "Already uploaded"}
            </span>
          </p>
        )}
      </div>
    );
  };

  if (f.isLoadingVendor) return <PageLoader />;

  const { personalInfo } = formData;

  const companies = formData.companies ?? [];
  const garages = formData.garages ?? [];

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30">
        <FormPageHeader title={TITLES[mode]} />
      </div>

      <div className="w-full p-4 mx-auto my-6 bg-white rounded-lg shadow-xl md:p-6">
        {f.error && (
          <div className="flex items-center gap-2 px-4 py-3 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{f.error}</span>
          </div>
        )}
        {f.success && (
          <div className="fixed z-50 flex items-center gap-2 px-5 py-3 text-green-700 border border-green-300 rounded-lg shadow-lg top-6 right-6 bg-green-50">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{f.success}</span>
          </div>
        )}

        <form onSubmit={f.handleSubmit} className="space-y-5">
          {/* 1 — Vendor Detail */}
          <Section theme={T.vendor} Icon={Store} title="Vendor Detail">
            <TextField
              label="Username"
              Icon={User}
              theme={T.vendor}
              viewMode={isView}
              name="username"
              value={formData.username}
              onChange={f.handleChange}
              placeholder="Enter username"
              maxLength={MAX_LENGTHS.username}
              autoComplete="off"
            />

            <TextField
              label={f.isEdit ? "Password (blank = unchanged)" : "Password"}
              Icon={Lock}
              theme={T.vendor}
              viewMode={isView}
              name="password"
              type={f.showPassword ? "text" : "password"}
              value={formData.password}
              onChange={f.handleChange}
              placeholder={f.isEdit ? "Enter new password" : "Enter password"}
              autoComplete="new-password"
              inputExtra="py-2.5 pr-14 text-sm"
              suffix={
                !isView && (
                  <button
                    type="button"
                    onClick={f.togglePassword}
                    tabIndex={-1}
                    className="absolute z-10 text-xs font-semibold -translate-y-1/2 right-3 top-1/2 text-violet-600"
                  >
                    {f.showPassword ? "Hide" : "Show"}
                  </button>
                )
              }
            />

            <TextField
              label="Vendor Name"
              Icon={UserRound}
              theme={T.vendor}
              viewMode={isView}
              name="name"
              value={formData.name}
              onChange={f.handleChange}
              placeholder="Enter vendor name"
              maxLength={MAX_LENGTHS.name}
            />

            <TextField
              label="Vendor Short Name"
              Icon={Tag}
              theme={T.vendor}
              viewMode={isView}
              name="shortName"
              value={formData.shortName}
              onChange={f.handleChange}
              placeholder="Enter short name"
              maxLength={MAX_LENGTHS.shortName}
            />

            <TextField
              label="Vendor Address"
              Icon={Home}
              theme={T.vendor}
              viewMode={isView}
              name="personalInfo.personalAddress"
              value={personalInfo.personalAddress}
              onChange={f.handleChange}
              placeholder="Enter address"
            />

            <SelectField
              label="City"
              Icon={MapPin}
              theme={T.vendor}
              viewMode={isView}
              name="personalInfo.personalCity"
              value={personalInfo.personalCity}
              onChange={f.handleCityChange}
              disabled={f.isLoadingCities}
              placeholder={
                f.isLoadingCities ? "Loading cities..." : "Select City"
              }
              options={f.cityNames as any}
            />

            <SelectField
              label="State"
              Icon={Landmark}
              theme={T.vendor}
              viewMode={isView}
              name="personalInfo.personalState"
              value={personalInfo.personalState}
              onChange={handleStateChange}
              loading={f.isLoadingStates}
              disabled={
                !personalInfo.personalCity ||
                f.isLoadingStates ||
                f.states.length === 0
              }
              placeholder={
                f.isLoadingStates
                  ? "Loading states..."
                  : !personalInfo.personalCity
                    ? "First select city"
                    : f.states.length === 0
                      ? "No states found"
                      : "Select State"
              }
              options={f.states.map((s) => s.stateName)}
            />

            {/* Region: state se auto-fill hota hai, user edit nahi kar sakta */}
            <TextField
              label="Region"
              Icon={Globe}
              theme={T.vendor}
              viewMode={true}
              name="region"
              value={
                regionLoading
                  ? "Loading region..."
                  : (formData.region ?? "") || "Auto-filled from state"
              }
              onChange={() => {}}
            />

           <MultiSelectField
              label="Vendor Category"
              Icon={Layers}
              theme={T.vendor}
              viewMode={isView}
              name="vendorCategory"
              value={formData.vendorCategory ?? ""}
              onChange={f.handleChange}
              placeholder="Select categories"
              options={VENDOR_CATEGORIES}
            />
          </Section>

          {/* 2 — Contact */}
          <Section theme={T.contact} Icon={Contact} title="Contact Information">
            {renderFields(CONTACT_FIELDS, T.contact)}
          </Section>

          {/* 3 — Company / Firm Details (har company ke saath uski Bank Details) */}
          <Section
            theme={T.company}
            Icon={Building2}
            title="Company / Firm Details"
          >
            {!isView && (
              <AddButton label="Add Company" onClick={f.addCompany} />
            )}

            {companies.map((company, index) => {
              const chequeBusy = !!f.chequeUploading[index];
              const chequeUploaded = !!company.cancelledCheque && !chequeBusy;

              return (
                <div
                  key={company.id ?? `new-company-${index}`}
                  className="p-3 border rounded-lg col-span-full border-slate-200 bg-slate-50/60"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-700">
                      Company {index + 1}
                    </h4>
                    {!isView && companies.length > 1 && (
                      <button
                        type="button"
                        onClick={() => f.removeCompany(index)}
                        disabled={f.isUploading}
                        className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <TextField
                      label="Company Name"
                      Icon={Building2}
                      theme={T.company}
                      viewMode={isView}
                      name={`companies.${index}.companyName` as any}
                      value={company.companyName ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        f.handleCompanyChange(
                          index,
                          "companyName",
                          e.target.value,
                        )
                      }
                      placeholder="Enter company name"
                    />
                    <SelectField
                      label="Company Type"
                      Icon={Briefcase}
                      theme={T.company}
                      viewMode={isView}
                      name={`companies.${index}.companyType` as any}
                      value={company.companyType ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        f.handleCompanyChange(
                          index,
                          "companyType",
                          e.target.value,
                        )
                      }
                      placeholder="Select type"
                      options={COMPANY_TYPES}
                    />
                    {COMPANY_FIELDS.map(
                      ({ name, label, Icon, type = "text" }) => (
                        <TextField
                          key={name}
                          label={label}
                          Icon={Icon}
                          theme={T.company}
                          viewMode={isView}
                          name={`companies.${index}.${name}` as any}
                          type={type}
                          value={(company[name] as string) ?? ""}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            f.handleCompanyChange(index, name, e.target.value)
                          }
                          placeholder={`Enter ${label.toLowerCase()}`}
                          inputMode={type === "tel" ? "numeric" : undefined}
                          maxLength={MAX_LENGTHS[name as string]}
                        />
                      ),
                    )}

                    {/* Is company ki Bank Details */}
                    <div className="pt-2 mt-1 border-t border-slate-200 col-span-full">
                      <h5 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Landmark className="w-4 h-4" />
                        Bank Details (Company {index + 1})
                      </h5>
                    </div>

                    {BANK_FIELDS.map(({ name, label, Icon, type = "text" }) => (
                      <TextField
                        key={name}
                        label={label}
                        Icon={Icon}
                        theme={T.company}
                        viewMode={isView}
                        name={`companies.${index}.${name}` as any}
                        type={type}
                        value={(company[name] as string) ?? ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          f.handleCompanyChange(index, name, e.target.value)
                        }
                        placeholder={`Enter ${label.toLowerCase()}`}
                        inputMode={type === "tel" ? "numeric" : undefined}
                        maxLength={MAX_LENGTHS[name as string]}
                      />
                    ))}

                    <div
                      className={`rounded-lg p-2 transition ${
                        chequeBusy
                          ? "bg-amber-50 ring-2 ring-amber-300"
                          : chequeUploaded
                            ? "bg-green-50 ring-2 ring-green-400"
                            : ""
                      }`}
                    >
                      <FileField
                        key={`cheque-${company.id ?? "new"}-${index}-${f.fileResetKey}`}
                        label="Cancelled Cheque"
                        Icon={FileText}
                        theme={T.company}
                        viewMode={isView}
                        file={null}
                        currentUrl={company.cancelledCheque}
                        onChange={f.handleCompanyChequeChange(index)}
                      />

                      {chequeBusy && (
                        <p className="mt-1 text-xs font-medium text-amber-600">
                          Uploading...
                        </p>
                      )}

                      {chequeUploaded && (
                        <p className="flex items-center gap-1 mt-1 text-xs font-medium text-green-600">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Uploaded</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isView && companies.length === 0 && (
              <p className="text-sm text-slate-500 col-span-full">
                No company added.
              </p>
            )}
          </Section>

          {/* 4 — Garage Details (multiple garages) */}
          <Section theme={T.company} Icon={Warehouse} title="Garage Details">
            {!isView && <AddButton label="Add Garage" onClick={f.addGarage} />}

            {garages.map((garage, index) => (
              <div
                key={garage.id ?? `new-garage-${index}`}
                className="p-3 border rounded-lg col-span-full border-slate-200 bg-slate-50/60"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-700">
                    Garage {index + 1}
                  </h4>
                  {!isView && garages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => f.removeGarage(index)}
                      className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <TextField
                    label="Garage Address"
                    Icon={MapPin}
                    theme={T.company}
                    viewMode={isView}
                    name={`garages.${index}.garageAddress` as any}
                    value={garage.garageAddress ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      f.handleGarageChange(
                        index,
                        "garageAddress",
                        e.target.value,
                      )
                    }
                    placeholder="Enter garage address"
                  />
                  <TextField
                    label="Garage Manager"
                    Icon={UserRound}
                    theme={T.company}
                    viewMode={isView}
                    name={`garages.${index}.garageManager` as any}
                    value={garage.garageManager ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      f.handleGarageChange(
                        index,
                        "garageManager",
                        e.target.value,
                      )
                    }
                    placeholder="Enter garage manager name"
                  />
                  <TextField
                    label="Garage Phone"
                    Icon={Phone}
                    theme={T.company}
                    viewMode={isView}
                    name={`garages.${index}.garagePhone` as any}
                    type="tel"
                    value={garage.garagePhone ?? ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      f.handleGarageChange(index, "garagePhone", e.target.value)
                    }
                    placeholder="Enter garage phone"
                    inputMode="numeric"
                    maxLength={10}
                  />
                </div>
              </div>
            ))}

            {isView && garages.length === 0 && (
              <p className="text-sm text-slate-500 col-span-full">
                No garage added.
              </p>
            )}
          </Section>

          {/* 5 — Documents */}
          <Section theme={T.docs} Icon={FileUp} title="Document Uploads">
            {DOC_FIELDS.map(({ key, label, Icon }) =>
              renderDocField({ key, label, Icon, theme: T.docs }),
            )}
          </Section>

          {!isView && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={f.saving || f.isUploading}
                className="px-6 py-2.5 text-sm font-medium text-white transition rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed"
              >
                {f.saving
                  ? "Saving..."
                  : f.isUploading
                    ? "Uploading documents..."
                    : f.isEdit
                      ? "Update Vendor Profile"
                      : "Save Vendor Profile"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <div className="w-12 h-12 mx-auto border-b-2 border-blue-500 rounded-full animate-spin" />
      <p className="mt-4 text-gray-600">Loading vendor data...</p>
    </div>
  </div>
);

export default VendorForm;
