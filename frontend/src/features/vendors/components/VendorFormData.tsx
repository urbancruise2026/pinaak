"use client";

import React from "react";
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
} from "lucide-react";
import FormPageHeader from "@/components/ui/PageHeader/FormPageHeader";
import { Section, TextField, SelectField, FileField } from "./vendorComponents/FormParts";
import {
  THEMES as T,
  COMPANY_FIELDS,
  COMPANY_TYPES,
  CONTACT_FIELDS,
  DOC_FIELDS,
  MAX_LENGTHS,
  type FieldConfig,
} from "./vendorComponents/constants";
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

const VendorForm: React.FC<VendorFormProps> = ({
  mode = "create",
  onBack,
  vendorId,
}) => {
  const f = useVendorForm({ mode, vendorId, onBack });
  const { formData, isView } = f;

  // contact + company dono sections ke config-driven inputs
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
        maxLength={MAX_LENGTHS[name]}
      />
    ));

  if (f.isLoadingVendor) return <PageLoader />;

  const { personalInfo } = formData;

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
              placeholder={f.isLoadingCities ? "Loading cities..." : "Select City"}
              options={f.cityNames as any}
            />

            <SelectField
              label="State"
              Icon={Landmark}
              theme={T.vendor}
              viewMode={isView}
              name="personalInfo.personalState"
              value={personalInfo.personalState}
              onChange={f.handleChange}
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
          </Section>

          {/* 2 — Contact */}
          <Section theme={T.contact} Icon={Contact} title="Contact Information">
            {renderFields(CONTACT_FIELDS, T.contact)}
          </Section>

          {/* 3 — Company */}
          <Section
            theme={T.company}
            Icon={Building2}
            title="Company / Firm Details"
          >
            <TextField
              label="Company Name"
              Icon={Building2}
              theme={T.company}
              viewMode={isView}
              name="companyName"
              value={formData.companyName}
              onChange={f.handleChange}
              placeholder="Enter company name"
            />
            <SelectField
              label="Company Type"
              Icon={Briefcase}
              theme={T.company}
              viewMode={isView}
              name="companyType"
              value={formData.companyType}
              onChange={f.handleChange}
              placeholder="Select type"
              options={COMPANY_TYPES}
            />
            {renderFields(COMPANY_FIELDS, T.company)}
          </Section>

          {/* 4 — Documents */}
          <Section theme={T.docs} Icon={FileUp} title="Document Uploads">
            {DOC_FIELDS.map(({ key, label, Icon }) => (
              <FileField
                key={key}
                label={label}
                Icon={Icon}
                theme={T.docs}
                viewMode={isView}
                file={f.files[key]}
                currentUrl={formData[key]}
                onChange={f.handleFileChange(key)}
              />
            ))}
          </Section>

          {!isView && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={f.saving}
                className="px-6 py-2.5 text-sm font-medium text-white transition rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed"
              >
                {f.saving
                  ? "Saving..."
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
