import { pool } from "../../config/mySqlDB.js";

const toNull = (val) => (val === "" || val === undefined ? null : val);

export const createDriverModel = async (data) => {
  try {
    const [columns] = await pool.execute("SHOW COLUMNS FROM drivers");
    const columnNames = columns.map((c) => c.Field);

    const fieldMapping = {
      // Personal Info
      first_name: data?.personalInfo?.firstName,
      last_name: data?.personalInfo?.lastName,
      date_of_birth: data?.personalInfo?.dateOfBirth,
      gender: data?.personalInfo?.gender,
      email: data?.personalInfo?.email,
      phone: data?.personalInfo?.phone,
      emergency_contact: data?.personalInfo?.emergencyContact,
      blood_group: data?.personalInfo?.bloodGroup,
      vendor: data?.personalInfo?.vendor,
      vendor_state: data?.personalInfo?.vendorState,
      vendor_city: data?.personalInfo?.vendorCity,

      // Permanent Address
      permanent_address: data?.addressInfo?.permanentAddress,
      permanent_city: data?.addressInfo?.permanentCity,
      permanent_state: data?.addressInfo?.permanentState,
      permanent_pincode: data?.addressInfo?.permanentPincode,

      // Current Address
      current_address: data?.addressInfo?.currentAddress,
      current_city: data?.addressInfo?.currentCity,
      current_state: data?.addressInfo?.currentState,
      current_pincode: data?.addressInfo?.currentPincode,

      // License Info
      license_number: data?.licenseInfo?.licenseNumber,
      license_type: data?.licenseInfo?.licenseType,
      issuing_authority: data?.licenseInfo?.issuingAuthority,
      issue_date: data?.licenseInfo?.issueDate,
      expiry_date: data?.licenseInfo?.expiryDate,
      experience_details: data?.licenseInfo?.experienceDetails,
      dl_front: data?.licenseInfo?.dlFront,
      dl_back: data?.licenseInfo?.dlBack,

      // Employment
      employee_id: data?.employmentInfo?.employeeId,

      // Documents
      aadhar_card: data?.documents?.aadharCard,
      pan_card: data?.documents?.panCard,
    };

    const fields = [];
    const placeholders = [];
    const values = [];

    for (const [dbField, value] of Object.entries(fieldMapping)) {
      if (
        columnNames.includes(dbField) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        fields.push(dbField);
        placeholders.push("?");
        values.push(value);
      }
    }

    if (fields.length === 0) {
      throw new Error("No valid fields to insert into drivers table");
    }

    const query = `
      INSERT INTO drivers (${fields.join(", ")})
      VALUES (${placeholders.join(", ")})
    `;

    const [result] = await pool.execute(query, values);
    return result;
  } catch (error) {
    console.error("❌ Error in createDriverModel:", error);
    throw error;
  }
};

export const getAllDriversModel = async () => {
  try {
    const [rows] = await pool.execute("SELECT * FROM drivers ORDER BY id DESC");
    return rows;
  } catch (error) {
    console.error("Error in getAllDriversModel:", error);
    throw error;
  }
};

export const getDriverByIdModel = async (id) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM drivers WHERE id = ?", [
      id,
    ]);
    return rows[0] || null;
  } catch (error) {
    console.error("Error in getDriverByIdModel:", error);
    throw error;
  }
};

export const updateDriverModel = async (id, data) => {
  try {
    const [columns] = await pool.execute("SHOW COLUMNS FROM drivers");
    const columnNames = columns.map((c) => c.Field);

    const updates = [];
    const values = [];

    const fieldMapping = {
      // Personal Information
      first_name: data?.personalInfo?.firstName,
      last_name: data?.personalInfo?.lastName,
      date_of_birth: data?.personalInfo?.dateOfBirth,
      gender: data?.personalInfo?.gender,
      email: data?.personalInfo?.email,
      phone: data?.personalInfo?.phone,
      emergency_contact: data?.personalInfo?.emergencyContact,
      blood_group: data?.personalInfo?.bloodGroup,
      vendor: data?.personalInfo?.vendor,
      vendor_state: data?.personalInfo?.vendorState,
      vendor_city: data?.personalInfo?.vendorCity,

      // Permanent Address
      permanent_address: data?.addressInfo?.permanentAddress,
      permanent_city: data?.addressInfo?.permanentCity,
      permanent_state: data?.addressInfo?.permanentState,
      permanent_pincode: data?.addressInfo?.permanentPincode,

      // Current Address
      current_address: data?.addressInfo?.currentAddress,
      current_city: data?.addressInfo?.currentCity,
      current_state: data?.addressInfo?.currentState,
      current_pincode: data?.addressInfo?.currentPincode,

      // License Information
      license_number: data?.licenseInfo?.licenseNumber,
      license_type: data?.licenseInfo?.licenseType,
      issuing_authority: data?.licenseInfo?.issuingAuthority,
      issue_date: data?.licenseInfo?.issueDate,
      experience_details: data?.licenseInfo?.experienceDetails,
      expiry_date: data?.licenseInfo?.expiryDate,
      dl_front: data?.licenseInfo?.dlFront,
      dl_back: data?.licenseInfo?.dlBack,

      // Employment Information
      employee_id: data?.employmentInfo?.employeeId,

      // Documents
      aadhar_card: data?.documents?.aadharCard,
      pan_card: data?.documents?.panCard,
    };

    for (const [dbField, value] of Object.entries(fieldMapping)) {
      if (
        columnNames.includes(dbField) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        updates.push(`${dbField} = ?`);
        values.push(toNull(value));
      }
    }

    if (updates.length === 0) {
      throw new Error("No valid fields to update");
    }

    values.push(id);
    const query = `UPDATE drivers SET ${updates.join(", ")} WHERE id = ?`;

    const [result] = await pool.execute(query, values);
    return result;
  } catch (error) {
    console.error("Error in updateDriverModel:", error);
    throw error;
  }
};

export const deleteDriverModel = async (id) => {
  try {
    const [result] = await pool.execute("DELETE FROM drivers WHERE id = ?", [
      id,
    ]);
    return result;
  } catch (error) {
    console.error("Error in deleteDriverModel:", error);
    throw error;
  }
};
