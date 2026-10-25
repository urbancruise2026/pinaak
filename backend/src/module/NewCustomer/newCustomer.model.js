import { pool } from "../../config/mySqlDB.js";

export const getAllCustomers = async () => {
  try {
    const sql = `
      SELECT 
        id,
        uuid,
        CONCAT_WS(' ', firstName, middleName, lastName) AS fullName,
        firstName,
        middleName,
        lastName,
        customerPhone,
        customerEmail,
        companyName,
        customerType,
        customerCategoryType,
        alternatePhone,
        countryName,
        customerCity,
        address,
        date_of_birth,
        anniversary,
        gender,
        state,
        pincode

      FROM customers
      ORDER BY id ASC
    `;

    const [rows] = await pool.execute(sql);
    return { customers: rows };
  } catch (error) {
    console.error("Get All Customers Error:", error);
    throw error;
  }
};

// In your customer.model.js
export const searchCustomers = async ({ search }) => {
  try {
    const searchTerm = `%${search || ""}%`;
    const sql = `
      SELECT 
        id,
        uuid,
        firstName,
        middleName,
        lastName,
        customerPhone,
        customerEmail,
        companyName,
        customerType,
        customerCategoryType,
        alternatePhone,
        countryName,
        customerCity,
        address,
        date_of_birth,
        anniversary,
        gender,
        state,
        pincode
      FROM customers
      WHERE 
        firstName LIKE ? OR
        middleName LIKE ? OR
        lastName LIKE ? OR
        CONCAT(firstName, ' ', lastName) LIKE ? OR
        CONCAT(firstName, ' ', middleName, ' ', lastName) LIKE ? OR
        customerPhone LIKE ? OR
        customerEmail LIKE ?
      ORDER BY firstName ASC
    `;
    const [rows] = await pool.execute(sql, [
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
    ]);
    return { customers: rows };
  } catch (error) {
    console.error("Search Customer Error:", error);
    throw error;
  }
};

export const updateCustomerById = async (id, data) => {
  const {
    firstName,
    middleName,
    lastName,
    customerPhone,
    customerEmail,
    companyName,
    customerType,
    customerCategoryType,
    alternatePhone,
    countryName,
    customerCity,
    address,
    date_of_birth,
    anniversary,
    gender,
    state,
    pincode,
  } = data;

  const sql = `
    UPDATE customers SET
      firstName = ?,
      middleName = ?,
      lastName = ?,
      customerPhone = ?,
      customerEmail = ?,
      companyName = ?,
      customerType = ?,
      customerCategoryType = ?,
      alternatePhone = ?,
      countryName = ?,
      customerCity = ?,
      address = ?,
      date_of_birth = ?,
      anniversary = ?,
      gender = ?,
      state = ?,
      pincode = ?
    WHERE id = ?
  `;

  const [result] = await pool.execute(sql, [
    firstName ?? null,
    middleName ?? null,
    lastName ?? null,
    customerPhone ?? null,
    customerEmail ?? null,
    companyName ?? null,
    customerType ?? null,
    customerCategoryType ?? null,
    alternatePhone ?? null,
    countryName ?? null,
    customerCity ?? null,
    address ?? null,
    date_of_birth ?? null,
    anniversary ?? null,
    gender ?? null,
    state ?? null,
    pincode ?? null,
    id,
  ]);

  return result;
};

export const getCustomerById = async (id) => {
  const sql = `
      SELECT *
      FROM customers
      WHERE id = ?
      LIMIT 1
    `;

  const [rows] = await pool.execute(sql, [id]);

  return rows[0] || null;
};
