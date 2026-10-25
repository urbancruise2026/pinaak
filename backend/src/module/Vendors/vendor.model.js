import { pool } from "../../config/mySqlDB.js";
import bcrypt from "bcrypt";
const toNull = (val) => (val === "" || val === undefined ? null : val);
export const findVendorById = async (id) => {
  try {
    const [rows] = await pool.execute(`SELECT * FROM vendors WHERE id = ?`, [
      id,
    ]);
    return rows[0] || null;
  } catch (error) {
    throw error;
  }
};
export const createVendorModel = async (data) => {
  try {
    // 1. Password validation - required field, empty/undefined allow mat karo
    if (
      !data.password ||
      typeof data.password !== "string" ||
      data.password.trim() === ""
    ) {
      throw new Error("Password is required to create a vendor");
    }

    // 2. Minimum length check (optional but recommended)
    if (data.password.length < 6) {
      throw new Error("Password must be at least 6 characters long");
    }

    // 3. Hash the password properly
    const saltRounds = 12; // 10 se 12 better hai, thoda zyada secure
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);

    const [columns] = await pool.execute("SHOW COLUMNS FROM vendors");
    const columnNames = columns.map((c) => c.Field);

    const fieldMapping = {
      username: data.username,
      password: hashedPassword, // hashed value use karo, raw data.password nahi
      name: data.name,
      email: data.email,
      phone: data.phone,

      owner_name: data.ownerName,
      owner_phone: data.ownerPhone,
      owner_email: data.ownerEmail,

      company_name: data.companyName,
      company_type: data.companyType,
      company_pan_number: data.companyPanNumber,
      company_registered_number: data.companyRegisteredNumber,

      gst_number: data.gstNumber,
      business_number: data.businessNumber,

      company_state: data?.companyinfo?.companyState,
      company_city: data?.companyinfo?.companyCity,

      registered_address: data.registeredAddress,
      garage_address: data.garageAddress,
      garage_phone: data.garagePhone,

      manager_name1: data.managerName1,
      manager_phone1: data.managerPhone1,
      manager_email1: data.managerEmail1,

      manager_name2: data.managerName2,
      manager_phone2: data.managerPhone2,
      manager_email2: data.managerEmail2,

      short_name: data.shortName,
      cooperative_name: data.cooperativeName,
      cooperative_number: data.cooperativeNumber,

      address: data.address,

      aadhaar_number: data.aadhaarNumber,

      personal_address: data?.personalInfo?.personalAddress,
      personal_city: data?.personalInfo?.personalCity,
      personal_state: data?.personalInfo?.personalState,
    };

    const fields = [];
    const placeholders = [];
    const values = [];

    for (const [key, value] of Object.entries(fieldMapping)) {
      if (
        columnNames.includes(key) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        fields.push(key);
        placeholders.push("?");
        values.push(toNull(value));
      }
    }

    const query = `
      INSERT INTO vendors (${fields.join(", ")})
      VALUES (${placeholders.join(", ")})
    `;

    const [result] = await pool.execute(query, values);

    // 4. Response me kabhi bhi hashed password wapas mat bhejo
    delete result.password;

    return result;
  } catch (error) {
    console.error("Error in createVendorModel:", error);
    throw error;
  }
};

export const updateVendorModel = async (id, data) => {
  try {
    const [columns] = await pool.execute("SHOW COLUMNS FROM vendors");
    const columnNames = columns.map((c) => c.Field);

    const fieldMapping = {
      name: data.name,
      email: data.email,
      phone: data.phone,

      owner_name: data.ownerName,
      owner_phone: data.ownerPhone,
      owner_email: data.ownerEmail,

      company_name: data.companyName,
      company_type: data.companyType,
      company_pan_number: data.companyPanNumber,

      company_registered_number: data.companyRegisteredNumber,
      gst_number: data.gstNumber,
      business_number: data.businessNumber,

      company_state: data?.companyinfo?.companyState,
      company_city: data?.companyinfo?.companyCity,

      registered_address: data.registeredAddress,
      garage_address: data.garageAddress,
      garage_phone: data.garagePhone,

      manager_name1: data.managerName1,
      manager_phone1: data.managerPhone1,
      manager_email1: data.managerEmail1,

      manager_name2: data.managerName2,
      manager_phone2: data.managerPhone2,
      manager_email2: data.managerEmail2,

      short_name: data.shortName,
      cooperative_name: data.cooperativeName,
      cooperative_number: data.cooperativeNumber,

      address: data.address,

      aadhaar_number: data.aadhaarNumber,

      personal_address: data?.personalInfo?.personalAddress,
      personal_city: data?.personalInfo?.personalCity,
      personal_state: data?.personalInfo?.personalState,
    };

    const updates = [];
    const values = [];

    for (const [key, value] of Object.entries(fieldMapping)) {
      if (
        columnNames.includes(key) &&
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        updates.push(`${key} = ?`);
        values.push(toNull(value));
      }
    }

    values.push(id);

    const query = `
      UPDATE vendors
      SET ${updates.join(", ")}
      WHERE id = ?
    `;

    const [result] = await pool.execute(query, values);
    return result;
  } catch (error) {
    console.error("Error in updateVendorModel:", error);
    throw error;
  }
};

export const getAllVendorsModel = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id, name, email, phone,
        company_name, company_type,
        gst_number, owner_name,
        personal_city, personal_state,
        short_name,
        created_at, updated_at
      FROM vendors
      ORDER BY id DESC
    `);

    return rows;
  } catch (error) {
    console.error("Error in getAllVendorsModel:", error);
    throw error;
  }
};

export const getVendorByIdModel = async (id) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        company_name, 
        company_type, 
        company_pan_number,
        company_registered_number,
        gst_number,
        owner_name,
        owner_phone,
        owner_email,
        personal_address,
        personal_city,
        personal_state,
        company_state,
        company_city,
        registered_address,
        garage_address,
        garage_phone,
        manager_name1,
        manager_phone1,
        manager_email1,
        manager_name2,
        manager_phone2,
        manager_email2,
        short_name,
        cooperative_name,
        cooperative_number,
        address,
        aadhaar_number,
        created_at,
        updated_at
      FROM vendors 
      WHERE id = ?
      `,
      [id],
    );

    if (!rows.length) return null;

    const vendor = rows[0];

    return {
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,

      companyName: vendor.company_name,
      companyType: vendor.company_type,
      companyPanNumber: vendor.company_pan_number, // ✅ FIXED
      companyRegisteredNumber: vendor.company_registered_number,

      gstNumber: vendor.gst_number,

      ownerName: vendor.owner_name,
      ownerPhone: vendor.owner_phone,
      ownerEmail: vendor.owner_email,

      shortName: vendor.short_name,
      cooperativeName: vendor.cooperative_name,
      cooperativeNumber: vendor.cooperative_number,

      registeredAddress: vendor.registered_address,
      garageAddress: vendor.garage_address,
      garagePhone: vendor.garage_phone,

      managerName1: vendor.manager_name1,
      managerPhone1: vendor.manager_phone1,
      managerEmail1: vendor.manager_email1,
      managerName2: vendor.manager_name2,
      managerPhone2: vendor.manager_phone2,
      managerEmail2: vendor.manager_email2,

      personalInfo: {
        personalAddress: vendor.personal_address,
        personalCity: vendor.personal_city,
        personalState: vendor.personal_state,
      },

      companyinfo: {
        companyState: vendor.company_state,
        companyCity: vendor.company_city,
      },

      address: vendor.address,
      aadhaarNumber: vendor.aadhaar_number,
    };
  } catch (error) {
    console.error("Error in getVendorByIdModel:", error);
    throw error;
  }
};
