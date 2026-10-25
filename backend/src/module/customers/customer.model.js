// import { pool } from "../../config/mySqlDB.js";
// import { generateUUID } from "../../utils/uuid.js";

// export const CUSTOMER_TABLE = "customers";

// const safe = (value) => (value === undefined || value === null ? null : value);

// export const CUSTOMER_COLUMNS = {
//   ID: "id",
//   UUID: "uuid",
//   FIRST_NAME: "first_name",
//   LAST_NAME: "last_name",
//   EMAIL: "email",
//   PHONE: "phone",
//   DATE_OF_BIRTH: "date_of_birth",
//   ANNIVERSARY: "anniversary",
//   GENDER: "gender",
//   ADDRESS: "address",
//   STATE: "state",
//   CITY: "city",
//   PINCODE: "pincode",
//   CREATED_AT: "created_at",
//   UPDATED_AT: "updated_at",
// };

// export const insertCustomer = async (data) => {
//   try {
//     const customerData = data || {};

//     const {
//       firstName,
//       lastName,
//       email,
//       phone,
//       dateOfBirth,
//       anniversary,
//       gender,
//       address,
//       state,
//       city,
//       pincode,
//     } = customerData;

//     const customerUuid = generateUUID();

//     const values = [
//       safe(customerUuid),
//       safe(firstName),
//       safe(lastName),
//       safe(email),
//       safe(phone),
//       safe(dateOfBirth),
//       safe(anniversary),
//       safe(gender),
//       safe(address),
//       safe(state),
//       safe(city),
//       safe(pincode),
//     ];

//     const sql = `
//       INSERT INTO ${CUSTOMER_TABLE} (
//         ${CUSTOMER_COLUMNS.UUID},
//         ${CUSTOMER_COLUMNS.FIRST_NAME},
//         ${CUSTOMER_COLUMNS.LAST_NAME},
//         ${CUSTOMER_COLUMNS.EMAIL},
//         ${CUSTOMER_COLUMNS.PHONE},
//         ${CUSTOMER_COLUMNS.DATE_OF_BIRTH},
//         ${CUSTOMER_COLUMNS.ANNIVERSARY},
//         ${CUSTOMER_COLUMNS.GENDER},
//         ${CUSTOMER_COLUMNS.ADDRESS},
//         ${CUSTOMER_COLUMNS.STATE},
//         ${CUSTOMER_COLUMNS.CITY},
//         ${CUSTOMER_COLUMNS.PINCODE}
//       ) VALUES (${values.map(() => "?").join(", ")})
//     `;

//     const [result] = await pool.execute(sql, values);

//     return {
//       id: result.insertId,
//       uuid: customerUuid,
//       firstName: firstName || null,
//       lastName: lastName || null,
//       email: email || null,
//       phone: phone || null,
//     };
//   } catch (error) {
//     console.error("Insert Customer Error:", error);
//     throw error;
//   }
// };

// export const findCustomerByUUID = async (uuid) => {
//   try {
//     if (!uuid) return null;

//     const [rows] = await pool.execute(
//       `SELECT * FROM ${CUSTOMER_TABLE} WHERE ${CUSTOMER_COLUMNS.UUID} = ?`,
//       [uuid]
//     );

//     return rows[0] || null;
//   } catch (error) {
//     console.error("Find Customer Error:", error);
//     throw error;
//   }
// };

// export const findCustomerByPhone = async (phone) => {
//   try {
//     if (!phone) return null;

//     const [rows] = await pool.execute(
//       `SELECT * FROM ${CUSTOMER_TABLE} WHERE ${CUSTOMER_COLUMNS.PHONE} = ?`,
//       [phone]
//     );

//     return rows[0] || null;
//   } catch (error) {
//     console.error("Find Customer By Phone Error:", error);
//     throw error;
//   }
// };

// export const findCustomerByEmail = async (email) => {
//   try {
//     if (!email) return null;

//     const [rows] = await pool.execute(
//       `SELECT * FROM ${CUSTOMER_TABLE} WHERE ${CUSTOMER_COLUMNS.EMAIL} = ?`,
//       [email]
//     );

//     return rows[0] || null;
//   } catch (error) {
//     console.error("Find Customer By Email Error:", error);
//     throw error;
//   }
// };

// export const getCustomers = async (page = 1, limit = 14) => {
//   try {
//     const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
//     const limitNumber = Math.max(parseInt(limit, 10) || 14, 1);

//     const offset = (pageNumber - 1) * limitNumber;

//     const [rows] = await pool.execute(
//       `SELECT * FROM ${CUSTOMER_TABLE}
//        ORDER BY ${CUSTOMER_COLUMNS.CREATED_AT} DESC
//        LIMIT ? OFFSET ?`,
//       [limitNumber, offset]
//     );

//     const [totalRows] = await pool.execute(
//       `SELECT COUNT(*) as count FROM ${CUSTOMER_TABLE}`
//     );
//     const total = totalRows[0]?.count || 0;

//     return {
//       customers: rows || [],
//       total,
//       page: pageNumber,
//       totalPages: Math.ceil(total / limitNumber) || 1,
//     };
//   } catch (error) {
//     console.error("getCustomers error:", error);
//     throw error;
//   }
// };

// export const updateCustomer = async (uuid, data) => {
//   try {
//     if (!uuid) throw new Error("UUID is required for update");

//     const customerData = data || {};

//     const {
//       firstName,
//       lastName,
//       email,
//       phone,
//       dateOfBirth,
//       anniversary,
//       gender,
//       address,
//       state,
//       city,
//       pincode,
//     } = customerData;

//     const updates = [];
//     const values = [];

//     if (firstName !== undefined) {
//       updates.push(`${CUSTOMER_COLUMNS.FIRST_NAME} = ?`);
//       values.push(safe(firstName));
//     }
//     if (lastName !== undefined) {
//       updates.push(`${CUSTOMER_COLUMNS.LAST_NAME} = ?`);
//       values.push(safe(lastName));
//     }
//     if (email !== undefined) {
//       updates.push(`${CUSTOMER_COLUMNS.EMAIL} = ?`);
//       values.push(safe(email));
//     }
//     if (phone !== undefined) {
//       updates.push(`${CUSTOMER_COLUMNS.PHONE} = ?`);
//       values.push(safe(phone));
//     }
//     if (dateOfBirth !== undefined) {
//       updates.push(`${CUSTOMER_COLUMNS.DATE_OF_BIRTH} = ?`);
//       values.push(safe(dateOfBirth));
//     }
//     if (anniversary !== undefined) {
//       updates.push(`${CUSTOMER_COLUMNS.ANNIVERSARY} = ?`);
//       values.push(safe(anniversary));
//     }
//     if (gender !== undefined) {
//       updates.push(`${CUSTOMER_COLUMNS.GENDER} = ?`);
//       values.push(safe(gender));
//     }
//     if (address !== undefined) {
//       updates.push(`${CUSTOMER_COLUMNS.ADDRESS} = ?`);
//       values.push(safe(address));
//     }
//     if (state !== undefined) {
//       updates.push(`${CUSTOMER_COLUMNS.STATE} = ?`);
//       values.push(safe(state));
//     }
//     if (city !== undefined) {
//       updates.push(`${CUSTOMER_COLUMNS.CITY} = ?`);
//       values.push(safe(city));
//     }
//     if (pincode !== undefined) {
//       updates.push(`${CUSTOMER_COLUMNS.PINCODE} = ?`);
//       values.push(safe(pincode));
//     }

//     updates.push(`${CUSTOMER_COLUMNS.UPDATED_AT} = NOW()`);

//     if (updates.length === 1) return null;

//     values.push(uuid);

//     const sql = `
//       UPDATE ${CUSTOMER_TABLE}
//       SET ${updates.join(", ")}
//       WHERE ${CUSTOMER_COLUMNS.UUID} = ?
//     `;

//     const [result] = await pool.execute(sql, values);
//     return result.affectedRows > 0;
//   } catch (error) {
//     console.error("Update Customer Error:", error);
//     throw error;
//   }
// };

// export const deleteCustomer = async (uuid) => {
//   try {
//     if (!uuid) return false;

//     const [result] = await pool.execute(
//       `DELETE FROM ${CUSTOMER_TABLE} WHERE ${CUSTOMER_COLUMNS.UUID} = ?`,
//       [uuid]
//     );

//     return result.affectedRows > 0;
//   } catch (error) {
//     console.error("Delete Customer Error:", error);
//     throw error;
//   }
// };

// export const searchCustomers = async (searchTerm, page = 1, limit = 14) => {
//   try {
//     if (!searchTerm) return getCustomers(page, limit);

//     const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
//     const limitNumber = Math.max(parseInt(limit, 10) || 14, 1);
//     const offset = (pageNumber - 1) * limitNumber;
//     const searchPattern = `%${searchTerm}%`;

//     const [rows] = await pool.execute(
//       `SELECT * FROM ${CUSTOMER_TABLE}
//        WHERE ${CUSTOMER_COLUMNS.FIRST_NAME} LIKE ?
//           OR ${CUSTOMER_COLUMNS.LAST_NAME} LIKE ?
//           OR ${CUSTOMER_COLUMNS.EMAIL} LIKE ?
//           OR ${CUSTOMER_COLUMNS.PHONE} LIKE ?
//           OR ${CUSTOMER_COLUMNS.CITY} LIKE ?
//        ORDER BY ${CUSTOMER_COLUMNS.CREATED_AT} DESC
//        LIMIT ? OFFSET ?`,
//       [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, limitNumber, offset]
//     );

//     const [totalRows] = await pool.execute(
//       `SELECT COUNT(*) as count FROM ${CUSTOMER_TABLE}
//        WHERE ${CUSTOMER_COLUMNS.FIRST_NAME} LIKE ?
//           OR ${CUSTOMER_COLUMNS.LAST_NAME} LIKE ?
//           OR ${CUSTOMER_COLUMNS.EMAIL} LIKE ?
//           OR ${CUSTOMER_COLUMNS.PHONE} LIKE ?
//           OR ${CUSTOMER_COLUMNS.CITY} LIKE ?`,
//       [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]
//     );

//     const total = totalRows[0]?.count || 0;

//     return {
//       customers: rows || [],
//       total,
//       page: pageNumber,
//       totalPages: Math.ceil(total / limitNumber) || 1,
//     };
//   } catch (error) {
//     console.error("searchCustomers error:", error);
//     throw error;
//   }
// };
