"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Building,
  CreditCard,
  AlertCircle,
} from "lucide-react";

interface DriverViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  driverData: any;
}

const DriverViewModal: React.FC<DriverViewModalProps> = ({
  isOpen,
  onClose,
  driverData,
}) => {
  const [formattedData, setFormattedData] = useState<any>(null);

  useEffect(() => {
    if (driverData) {
      // Format the data for display
      setFormattedData({
        id: driverData.id,
        personalInfo: {
          firstName:
            driverData.personalInfo?.firstName || driverData.first_name || "",
          lastName:
            driverData.personalInfo?.lastName || driverData.last_name || "",
          fullName:
            `${driverData.personalInfo?.firstName || driverData.first_name || ""} ${driverData.personalInfo?.lastName || driverData.last_name || ""}`.trim(),
          dateOfBirth:
            driverData.personalInfo?.dateOfBirth ||
            driverData.date_of_birth ||
            "",
          gender: driverData.personalInfo?.gender || driverData.gender || "",
          email: driverData.personalInfo?.email || driverData.email || "",
          phone: driverData.personalInfo?.phone || driverData.phone || "",
          emergencyContact:
            driverData.personalInfo?.emergencyContact ||
            driverData.emergency_contact ||
            "",
          bloodGroup:
            driverData.personalInfo?.bloodGroup || driverData.blood_group || "",
          vendor: driverData.personalInfo?.vendor || driverData.vendor || "",
          vendorState:
            driverData.personalInfo?.vendorState ||
            driverData.vendor_state ||
            "",
          vendorCity:
            driverData.personalInfo?.vendorCity || driverData.vendor_city || "",
        },
        addressInfo: {
          permanentAddress:
            driverData.addressInfo?.permanentAddress ||
            driverData.permanent_address ||
            "",
          currentAddress:
            driverData.addressInfo?.currentAddress ||
            driverData.current_address ||
            "",
          city: driverData.addressInfo?.city || driverData.city || "",
          state: driverData.addressInfo?.state || driverData.state || "",
          pincode: driverData.addressInfo?.pincode || driverData.pincode || "",
        },
        licenseInfo: {
          licenseNumber:
            driverData.licenseInfo?.licenseNumber ||
            driverData.license_number ||
            "",
          licenseType:
            driverData.licenseInfo?.licenseType ||
            driverData.license_type ||
            "",
          issuingAuthority:
            driverData.licenseInfo?.issuingAuthority ||
            driverData.issuing_authority ||
            "",
          issueDate:
            driverData.licenseInfo?.issueDate || driverData.issue_date || "",
          expiryDate:
            driverData.licenseInfo?.expiryDate || driverData.expiry_date || "",
          experienceDetails:
            driverData.licenseInfo?.experienceDetails ||
            driverData.experience_details ||
            "",
        },
        employmentInfo: {
          employeeId:
            driverData.employmentInfo?.employeeId ||
            driverData.employee_id ||
            "",
        },
        documents: {
          aadharCard:
            driverData.documents?.aadharCard || driverData.aadhar_card || "",
          panCard: driverData.documents?.panCard || driverData.pan_card || "",
        },
      });
    }
  }, [driverData]);

  if (!isOpen) return null;

  const InfoRow = ({ label, value, icon: Icon, iconColor = "blue" }: any) => (
    <div className="flex items-start gap-3 p-3 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0 mt-1">
        {Icon && <Icon className={`w-5 h-5 text-${iconColor}-500`} />}
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm text-gray-900 font-medium mt-1">{value || "—"}</p>
      </div>
    </div>
  );

  const SectionHeader = ({ title, icon: Icon, bgColor = "blue" }: any) => {
    const colorClasses = {
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
        icon: "text-blue-600",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        icon: "text-green-600",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-700",
        icon: "text-purple-600",
      },
      yellow: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
        icon: "text-yellow-600",
      },
    };
    const colors =
      colorClasses[bgColor as keyof typeof colorClasses] || colorClasses.blue;

    return (
      <div
        className={`flex items-center gap-2 mb-4 pb-2 border-b-2 ${colors.border}`}
      >
        <Icon className={`w-5 h-5 ${colors.icon}`} />
        <h3 className={`text-lg font-semibold ${colors.text}`}>{title}</h3>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-orange-100 text-orange-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Driver Details
              </h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <p>
                  Employee ID:{" "}
                  {formattedData?.employmentInfo?.employeeId || "—"}
                </p>
                <p>Full Name: {formattedData?.personalInfo?.fullName || "—"}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-orange-200 rounded-lg transition"
            >
              <X className="w-6 h-6 text-orange-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {!formattedData ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-200 border-t-orange-600" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Personal Information - Blue */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <SectionHeader
                    title="Personal Information"
                    icon={User}
                    bgColor="blue"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                    <InfoRow
                      label="Full Name"
                      value={formattedData.personalInfo.fullName}
                      icon={User}
                      iconColor="blue"
                    />
                    <InfoRow
                      label="Employee ID"
                      value={formattedData.employmentInfo.employeeId}
                      icon={CreditCard}
                      iconColor="blue"
                    />
                    <InfoRow
                      label="Date of Birth"
                      value={formattedData.personalInfo.dateOfBirth}
                      icon={Calendar}
                      iconColor="blue"
                    />
                    <InfoRow
                      label="Gender"
                      value={formattedData.personalInfo.gender}
                      icon={User}
                      iconColor="blue"
                    />
                    <InfoRow
                      label="Email"
                      value={formattedData.personalInfo.email}
                      icon={Mail}
                      iconColor="blue"
                    />
                    <InfoRow
                      label="Phone"
                      value={formattedData.personalInfo.phone}
                      icon={Phone}
                      iconColor="blue"
                    />
                    <InfoRow
                      label="Emergency Contact"
                      value={formattedData.personalInfo.emergencyContact}
                      icon={Phone}
                      iconColor="blue"
                    />
                    <InfoRow
                      label="Blood Group"
                      value={formattedData.personalInfo.bloodGroup}
                      icon={AlertCircle}
                      iconColor="blue"
                    />
                    <InfoRow
                      label="Vendor"
                      value={formattedData.personalInfo.vendor}
                      icon={Building}
                      iconColor="blue"
                    />
                    <InfoRow
                      label="Vendor City"
                      value={formattedData.personalInfo.vendorCity}
                      icon={MapPin}
                      iconColor="blue"
                    />
                    <InfoRow
                      label="Vendor State"
                      value={formattedData.personalInfo.vendorState}
                      icon={MapPin}
                      iconColor="blue"
                    />
                  </div>
                </div>

                {/* Address Information - Green */}
                <div className="bg-green-50 rounded-lg p-4">
                  <SectionHeader
                    title="Address Information"
                    icon={MapPin}
                    bgColor="green"
                  />
                  <div className="grid grid-cols-1 gap-2">
                    <InfoRow
                      label="Permanent Address"
                      value={formattedData.addressInfo.permanentAddress}
                      icon={MapPin}
                      iconColor="green"
                    />
                    <InfoRow
                      label="Current Address"
                      value={formattedData.addressInfo.currentAddress}
                      icon={MapPin}
                      iconColor="green"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <InfoRow
                        label="City"
                        value={formattedData.addressInfo.city}
                        icon={MapPin}
                        iconColor="green"
                      />
                      <InfoRow
                        label="State"
                        value={formattedData.addressInfo.state}
                        icon={MapPin}
                        iconColor="green"
                      />
                      <InfoRow
                        label="Pincode"
                        value={formattedData.addressInfo.pincode}
                        icon={MapPin}
                        iconColor="green"
                      />
                    </div>
                  </div>
                </div>

                {/* License Information - Purple */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <SectionHeader
                    title="License Information"
                    icon={FileText}
                    bgColor="purple"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    <InfoRow
                      label="License Number"
                      value={formattedData.licenseInfo.licenseNumber}
                      icon={FileText}
                      iconColor="purple"
                    />
                    <InfoRow
                      label="License Type"
                      value={formattedData.licenseInfo.licenseType}
                      icon={FileText}
                      iconColor="purple"
                    />
                    <InfoRow
                      label="Issuing Authority"
                      value={formattedData.licenseInfo.issuingAuthority}
                      icon={Building}
                      iconColor="purple"
                    />
                    <InfoRow
                      label="Issue Date"
                      value={formattedData.licenseInfo.issueDate}
                      icon={Calendar}
                      iconColor="purple"
                    />
                    <InfoRow
                      label="Expiry Date"
                      value={formattedData.licenseInfo.expiryDate}
                      icon={Calendar}
                      iconColor="purple"
                    />
                    <InfoRow
                      label="Experience (Years)"
                      value={formattedData.licenseInfo.experienceDetails}
                      icon={AlertCircle}
                      iconColor="purple"
                    />
                  </div>
                </div>

                {/* Documents - Yellow */}
                {(formattedData.documents.aadharCard ||
                  formattedData.documents.panCard) && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <SectionHeader
                      title="Documents"
                      icon={FileText}
                      bgColor="yellow"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {formattedData.documents.aadharCard && (
                        <InfoRow
                          label="Aadhar Card"
                          value={
                            <a
                              href={formattedData.documents.aadharCard}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Document
                            </a>
                          }
                          icon={FileText}
                          iconColor="yellow"
                        />
                      )}
                      {formattedData.documents.panCard && (
                        <InfoRow
                          label="Pan Card"
                          value={
                            <a
                              href={formattedData.documents.panCard}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Document
                            </a>
                          }
                          icon={FileText}
                          iconColor="yellow"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverViewModal;
