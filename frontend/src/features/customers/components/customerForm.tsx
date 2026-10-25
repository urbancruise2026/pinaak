"use client";

import React from "react";
import {
  User,
  UserRound,
  Users,
  Mail,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Landmark,
  Home,
  Building2,
  Globe,
  Layers,
  FileUp,
  Hash,
  Loader2,
} from "lucide-react";
import FormPageHeader from "@/components/ui/PageHeader/FormPageHeader";
import type { FormMode } from "./customerFormComponents/types"; // <-- apna existing type ka path
import {
  Section,
  TextField,
  TextAreaField,
  SelectField,
  PhoneField,
  FileField,
} from "./customerFormComponents/FormParts";
import CustomerSearch from "./customerFormComponents/CustomerSearch";
import {
  THEMES as T,
  CATEGORY_OPTIONS,
  CUSTOMER_CATEGORIES,
  DOC_FIELDS,
  MAX_LENGTHS,
} from "./customerFormComponents/constants";
import { useCustomerForm } from "./customerFormComponents/useCustomerForm";

interface Props {
  mode?: FormMode;
  onBack?: () => void;
}

const TITLES: Record<FormMode, string> = {
  create: "Customer Registration Form",
  edit: "Edit Customer",
  view: "View Customer",
};

const PREFIX_BASE =
  "text-xs font-semibold text-center border-r bg-violet-100 text-violet-800 border-violet-200";

const CustomerPersonal: React.FC<Props> = ({ mode = "create", onBack }) => {
  const f = useCustomerForm({ mode, onBack });
  const { formData, isView } = f;
  const viewMode = isView;

  const showCompany =
    formData.customerType !== "" && formData.customerType !== "Personal";

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="sticky top-0 z-30">
        <FormPageHeader title={TITLES[mode]} />
      </div>

      <div className="w-full p-4 mx-auto my-6 bg-white rounded-lg shadow-xl md:p-6">
        {f.error && (
          <div className="flex items-start gap-2 p-4 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <span className="font-medium">{f.error}</span>
          </div>
        )}
        {f.success && (
          <div className="fixed z-50 flex items-center gap-2 px-5 py-3 text-green-700 border border-green-300 rounded-lg shadow-lg top-6 right-6 bg-green-50">
            <CheckCircle2 size={20} />
            <span className="font-medium">
              Customer {f.isEdit ? "updated" : "registered"} successfully!
            </span>
          </div>
        )}

        <form onSubmit={f.handleSubmit} className="space-y-5">
          {/* 1 — Customer Information */}
          <Section
            theme={T.info}
            Icon={UserRound}
            title="Customer Information"
            action={
              f.isCreate && (
                <CustomerSearch theme={T.info} onSelect={f.applyCustomer} />
              )
            }
          >
            <TextField
              label="First Name"
              Icon={User}
              theme={T.info}
              viewMode={viewMode}
              required
              placeholder="Enter first name"
              maxLength={MAX_LENGTHS.firstName}
              {...f.field("firstName")}
            />
            <TextField
              label="Middle Name"
              Icon={User}
              theme={T.info}
              viewMode={viewMode}
              placeholder="Enter middle name"
              maxLength={MAX_LENGTHS.middleName}
              {...f.field("middleName")}
            />
            <TextField
              label="Last Name"
              Icon={User}
              theme={T.info}
              viewMode={viewMode}
              required
              placeholder="Enter last name"
              maxLength={MAX_LENGTHS.lastName}
              {...f.field("lastName")}
            />
            <TextField
              label="Email"
              Icon={Mail}
              theme={T.info}
              viewMode={viewMode}
              type="email"
              placeholder="Enter email address"
              maxLength={MAX_LENGTHS.email}
              {...f.field("email")}
            />

            <PhoneField
              label="Phone No. (India)"
              theme={T.info}
              viewMode={viewMode}
              required
              placeholder="10 digit number"
              maxLength={MAX_LENGTHS.phone}
              prefix={
                <div className={`px-3 py-2.5 min-w-[78px] ${PREFIX_BASE}`}>
                  +91 IND
                </div>
              }
              {...f.field("phone")}
            />

            <PhoneField
              label="Phone No. (Other)"
              theme={T.info}
              viewMode={viewMode}
              placeholder="Enter phone number"
              maxLength={MAX_LENGTHS.alternatePhone}
              prefix={
                <select
                  name="alternateCountryCode"
                  value={formData.alternateCountryCode}
                  onChange={f.handleChange}
                  disabled={viewMode}
                  className={`px-2 py-2.5 min-w-[95px] outline-none cursor-pointer ${PREFIX_BASE}`}
                >
                  <option value="">Code</option>
                  {f.countries.map((c) => (
                    <option key={c.id} value={c.phone_code}>
                      {c.phone_code} {c.country_code}
                    </option>
                  ))}
                </select>
              }
              {...f.field("alternatePhone")}
            />

            <SelectField
              label="Country"
              Icon={Globe}
              theme={T.info}
              viewMode={viewMode}
              disabled={f.countriesLoading}
              placeholder={
                f.countriesLoading ? "Loading countries..." : "Select Country"
              }
              options={f.countries.map((c) => c.country_name)}
              {...f.field("countryName")}
            />

            <SelectField
              label="Customer Category"
              Icon={Users}
              theme={T.info}
              viewMode={viewMode}
              required
              placeholder="Select Customer Category"
              options={CUSTOMER_CATEGORIES}
              {...f.field("customerType")}
            />

            <SelectField
              label="Customer Type"
              Icon={Layers}
              theme={T.info}
              viewMode={viewMode}
              required={!!formData.customerType}
              disabled={!formData.customerType}
              placeholder="Select Customer Type"
              options={CATEGORY_OPTIONS[formData.customerType] ?? []}
              {...f.field("customerCategoryType")}
            />

            {showCompany && (
              <TextField
                label="Company Name"
                Icon={Building2}
                theme={T.info}
                viewMode={viewMode}
                placeholder="Enter company name"
                maxLength={MAX_LENGTHS.companyName}
                {...f.field("companyName")}
              />
            )}
          </Section>

          {/* 2 — Address */}
          <Section theme={T.address} Icon={Home} title="Address Information">
            <TextAreaField
              label="Address"
              Icon={Home}
              theme={T.address}
              viewMode={viewMode}
              required
              rows={3}
              placeholder="Enter complete address"
              wrapperClassName="sm:col-span-2 lg:col-span-4"
              {...f.field("address")}
            />

            <SelectField
              label="City"
              Icon={MapPin}
              theme={T.address}
              viewMode={viewMode}
              required
              disabled={f.isLoadingCities}
              placeholder={f.isLoadingCities ? "Loading cities..." : "Select City"}
              options={f.cityNames}
              {...f.field("city")}
              onChange={f.handleCityChange}
            />

            <SelectField
              label="State"
              Icon={Landmark}
              theme={T.address}
              viewMode={viewMode}
              required
              loading={f.statesLoading}
              disabled={
                !formData.city || f.statesLoading || f.stateNames.length === 0
              }
              placeholder={
                f.statesLoading
                  ? "Loading states..."
                  : !formData.city
                    ? "First select city"
                    : "Select State"
              }
              options={f.stateNames}
              {...f.field("state")}
              onChange={f.handleStateChange}
            />

            <TextField
              label="Pincode"
              Icon={Hash}
              theme={T.address}
              viewMode={viewMode}
              required
              placeholder="6-digit pincode"
              maxLength={MAX_LENGTHS.pincode}
              inputMode="numeric"
              {...f.field("pincode")}
            />
          </Section>

          {/* 3 — Documents */}
          <Section theme={T.docs} Icon={FileUp} title="Document Uploads">
            {DOC_FIELDS.map(({ key, label, Icon }) => (
              <FileField
                key={key}
                label={label}
                Icon={Icon}
                theme={T.docs}
                viewMode={viewMode}
                file={f.files[key]}
                onChange={f.handleFileChange(key)}
              />
            ))}
          </Section>

          {/* Buttons */}
          {!isView && (
            <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={f.submitDisabled}
                className="px-10 py-3 text-lg font-semibold text-white transition-all bg-orange-600 rounded-full shadow-md hover:bg-orange-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {f.saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </span>
                ) : f.isEdit ? (
                  "Update Customer"
                ) : (
                  "Register Customer"
                )}
              </button>

              {f.isEdit && (
                <button
                  type="button"
                  onClick={f.handleBack}
                  disabled={f.saving}
                  className="px-8 py-3 font-semibold text-gray-700 transition-all bg-gray-100 border border-gray-300 rounded-full hover:bg-gray-200 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CustomerPersonal;
