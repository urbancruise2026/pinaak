// src/features/drivers/driver.types.ts
export interface DriverPersonalInfo {
  firstName: string; lastName: string; dateOfBirth: string; gender: string;
  email: string; phone: string; emergencyContact: string; bloodGroup: string;
  vendor: string; vendorState: string; vendorCity: string;
}

export interface DriverAddressInfo {
  permanentAddress: string; permanentCity: string; permanentState: string; permanentPincode: string;
  currentAddress: string; currentCity: string; currentState: string; currentPincode: string;
}

export interface DriverLicenseInfo {
  licenseNumber: string; licenseType: string; issuingAuthority: string; issueDate: string;
  experienceDetails: string; expiryDate: string; dlFront: string; dlBack: string;
}

export interface DriverFormData {
  personalInfo: DriverPersonalInfo;
  addressInfo: DriverAddressInfo;
  licenseInfo: DriverLicenseInfo;
  employmentInfo: { employeeId: string };
  documents: { aadharCard: string; panCard: string };
}

export type DriverResponse = { id: number; message?: string; status?: string } & Partial<DriverFormData>;