"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { useSelector } from "react-redux";
import { Building, FileText, Globe, Mail, Phone, User } from "lucide-react";
import { RootState } from "@/store/store";
import { CATEGORY_OPTIONS } from "../../types/Editleads/editleaddata";
import FormSection from "./FormSection";
import FormField, { inputClass, labelClass } from "./FormField";
import type { CustomerFields, LeadFormData } from "./schema";

interface CustomerSectionProps {
  headerAction: React.ReactNode; // the customer search box
  formData: CustomerFields;
  onFieldChange: (name: keyof CustomerFields, value: string) => void;
  onFieldTouched: (field: string) => void;
  onCategoryChange: (value: string) => void;
  onCheckPhone: (phone: string) => void;
  alternateCountryCode: string;
  setAlternateCountryCode: (value: string) => void;
  customerCategoryTypeValue: string;
  setCustomerCategoryTypeValue: (value: string) => void;
}

const digitsOnly = (value: string) => value.replace(/[^0-9]/g, "");

const CustomerSection: React.FC<CustomerSectionProps> = ({
  headerAction,
  formData,
  onFieldChange,
  onFieldTouched,
  onCategoryChange,
  onCheckPhone,
  alternateCountryCode,
  setAlternateCountryCode,
  customerCategoryTypeValue,
  setCustomerCategoryTypeValue,
}) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<LeadFormData>();

  const { countries } = useSelector((state: RootState) => state.country);
  const { cities, statesForCity, citiesLoading, statesLoading } = useSelector(
    (state: RootState) => state.stateCity,
  );

  const customerType = watch("customerType");
  const customerCity = watch("customerCity");
  const countryName = watch("countryName");

  const customerTypeField = register("customerType");
  const customerCategoryTypeField = register("customerCategoryType");

  // Props shared by the plain text inputs that live in local state
  const textInput = (name: keyof CustomerFields) => ({
    name,
    value: formData[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      onFieldChange(name, e.target.value),
    onBlur: () => onFieldTouched(name),
  });

  return (
    <FormSection
      step={2}
      title="Customer Information"
      theme="green"
      action={headerAction}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <FormField
          label="First Name"
          required
          icon={User}
          iconClassName="text-green-600"
          info
        >
          <input
            {...textInput("firstName")}
            className={inputClass}
            maxLength={50}
            placeholder="Enter Customer first name"
            required
          />
        </FormField>

        <FormField
          label="Middle Name"
          icon={User}
          iconClassName="text-green-600"
          info
        >
          <input
            {...textInput("middleName")}
            className={inputClass}
            maxLength={50}
            placeholder="Enter Customer middle name"
          />
        </FormField>

        <FormField
          label="Last Name"
          required
          icon={User}
          iconClassName="text-green-600"
          info
        >
          <input
            {...textInput("lastName")}
            className={inputClass}
            maxLength={50}
            placeholder="Enter Customer last name"
            required
          />
        </FormField>

        {/* Phone No. (India) */}
        <div>
          <label className={labelClass}>
            Phone No. (India) <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center bg-white border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <div className="bg-gray-100 px-3 py-2 text-sm font-medium min-w-[80px] text-center">
              +91 IND
            </div>
            <input
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                const numericValue = digitsOnly(e.target.value);
                onFieldChange("phone", numericValue);
                // check for an existing customer once 10 digits are entered
                if (numericValue.length === 10) onCheckPhone(numericValue);
              }}
              placeholder="Enter 10 digit number"
              className="w-full py-2 px-3 outline-none"
              maxLength={10}
              inputMode="numeric"
              required
            />
            <Phone
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
              size={20}
            />
          </div>
        </div>

        {/* Alternate phone */}
        <div>
          <label className={labelClass}>Phone No. (Other)</label>
          <div className="relative flex items-center bg-white border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
            <select
              value={alternateCountryCode}
              onChange={(e) => setAlternateCountryCode(e.target.value)}
              className="bg-gray-100 px-2 py-2 outline-none text-sm cursor-pointer min-w-[100px]"
            >
              <option value="">Select Code</option>
              {countries.map((code) => (
                <option key={code.id} value={code.country_code}>
                  {code.country_code} {code.phone_code}
                </option>
              ))}
            </select>
            <input
              name="alternatePhone"
              value={formData.alternatePhone}
              onChange={(e) =>
                onFieldChange("alternatePhone", digitsOnly(e.target.value))
              }
              placeholder="Enter phone number"
              className="w-full py-2 px-3 outline-none"
              maxLength={15}
              inputMode="numeric"
            />
            <Phone
              className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
              size={20}
            />
          </div>
        </div>

        <FormField label="Email" icon={Mail} iconClassName="text-green-600" info>
          <input
            {...textInput("email")}
            type="email"
            placeholder="Enter email address"
            className={inputClass}
            maxLength={100}
          />
        </FormField>

        <FormField
          label="Customer Category"
          required
          icon={FileText}
          iconClassName="text-green-600"
          info
          error={errors.customerType?.message}
        >
          <select
            {...customerTypeField}
            onChange={(e) => {
              customerTypeField.onChange(e);
              onCategoryChange(e.target.value);
            }}
            className={inputClass}
          >
            <option value="">Select Customer Category</option>
            <option value="Personal">Personal</option>
            <option value="Corporate">Corporate</option>
            <option value="Travel Agent">Agent</option>
          </select>
        </FormField>

        <FormField
          label="Customer Type"
          icon={FileText}
          iconClassName="text-green-600"
        >
          <select
            {...customerCategoryTypeField}
            value={customerCategoryTypeValue}
            onChange={(e) => {
              customerCategoryTypeField.onChange(e);
              setCustomerCategoryTypeValue(e.target.value);
            }}
            className={inputClass}
          >
            <option value="">Select Customer Type</option>
            {customerType &&
              CATEGORY_OPTIONS[customerType]?.map((item, index) => (
                <option key={index} value={item}>
                  {item}
                </option>
              ))}
          </select>
        </FormField>

        {customerType !== "Personal" && (
          <FormField
            label="Company Name"
            icon={Building}
            iconClassName="text-green-600"
            info
          >
            <input
              {...textInput("companyName")}
              className={inputClass}
              maxLength={100}
              placeholder="Enter company name"
            />
          </FormField>
        )}

        <FormField
          label="Country Name"
          icon={Globe}
          info
          error={errors.countryName?.message}
        >
          <select {...register("countryName")} className={inputClass}>
            <option value="">Select Country</option>
            {countries
              .slice()
              .sort((a, b) => {
                if (a.country_name === "India") return -1;
                if (b.country_name === "India") return 1;
                return a.country_name.localeCompare(b.country_name);
              })
              .map((country) => (
                <option key={country.id} value={country.country_name}>
                  {country.country_name}
                </option>
              ))}
          </select>
        </FormField>

        {countryName === "India" && (
          <FormField label="Customer City" icon={Globe} info>
            <select
              {...register("customerCity")}
              className={inputClass}
              disabled={citiesLoading}
            >
              <option value="">
                {citiesLoading ? "Loading cities..." : "Select Customer City"}
              </option>
              {cities?.map((city) => (
                <option key={city.id || city.uuid} value={city.cityName}>
                  {city.cityName}
                </option>
              ))}
            </select>
          </FormField>
        )}

        {countryName === "India" && (
          <FormField label="Customer State" icon={Globe} info>
            <select
              {...register("state")}
              className={inputClass}
              disabled={!customerCity || statesLoading}
            >
              <option value="">
                {!customerCity
                  ? "Please select a city first"
                  : statesLoading
                    ? "Loading states..."
                    : "Select Customer State"}
              </option>
              {statesForCity?.map((state) => (
                <option key={state.id} value={state.stateName}>
                  {state.stateName}
                </option>
              ))}
            </select>
          </FormField>
        )}

        <div className="w-full">
          <label className={labelClass}>Customer Address</label>
          <textarea
            {...register("address")}
            className="w-full py-2 px-3 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter complete customer address"
            rows={2}
          />
        </div>
      </div>
    </FormSection>
  );
};

export default CustomerSection;