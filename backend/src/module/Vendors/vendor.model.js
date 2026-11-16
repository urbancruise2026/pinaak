import { pool } from "../../config/mySqlDB.js";
// username/password add karne par: import bcrypt from "bcrypt";

const toNull = (val) =>
  val === "" || val === undefined || val === null ? null : val;

const isEmpty = (v) => v === undefined || v === null || v === "";

// form ke document keys -> vendor_documents.doc_type
const DOC_TYPE_MAP = {
  passportPhoto: "passport_photo",
  panDoc: "pan",
  adharDoc: "aadhaar",
  gstDoc: "gst",
  vendorProof: "vendor_proof",
  vehicleDoc: "vehicle",
};

const CONTACT_ROLES = [
  ["owner", "ownerName", "ownerPhone", "ownerEmail"],
  ["ops_manager", "managerName1", "managerPhone1", "managerEmail1"],
  ["accountant", "managerName2", "managerPhone2", "managerEmail2"],
];

/* ---------- Helpers ---------- */

// 1:1 table (vendor_personal / vendor_companies) me insert ya update
// (table name sirf internal constants se aata hai, user input se nahi)
const upsertOneToOne = async (conn, table, vendorId, cols) => {
  const entries = Object.entries(cols).filter(([, v]) => v !== undefined);
  if (!entries.length) return;

  const names = entries.map(([k]) => k);
  const sql = `
    INSERT INTO ${table} (vendor_id, ${names.join(", ")})
    VALUES (?, ${names.map(() => "?").join(", ")})
    ON DUPLICATE KEY UPDATE ${names.map((n) => `${n} = VALUES(${n})`).join(", ")}
  `;
  await conn.execute(sql, [vendorId, ...entries.map(([, v]) => toNull(v))]);
};

// create + update dono yahin se related tables save karte hain
const saveRelated = async (conn, vendorId, data) => {
  await upsertOneToOne(conn, "vendor_personal", vendorId, {
    address: data.address,
    personal_address: data.personalInfo?.personalAddress,
    personal_city: data.personalInfo?.personalCity,
    personal_state: data.personalInfo?.personalState,
    aadhaar_number: data.aadhaarNumber,
  });

  await upsertOneToOne(conn, "vendor_companies", vendorId, {
    company_name: data.companyName,
    company_type: data.companyType,
    company_pan_number: data.companyPanNumber,
    company_registered_number: data.companyRegisteredNumber,
    gst_number: data.gstNumber,
    business_number: data.businessNumber,
    registered_address: data.registeredAddress,
    garage_address: data.garageAddress,
    garage_phone: data.garagePhone,
    company_state: data.companyinfo?.companyState,
    company_city: data.companyinfo?.companyCity,
    cooperative_name: data.cooperativeName,
    cooperative_number: data.cooperativeNumber,
  });

  for (const [role, nameKey, phoneKey, emailKey] of CONTACT_ROLES) {
    const name = data[nameKey];
    const phone = data[phoneKey];
    const email = data[emailKey];

    // form ne is role ke fields bheje hi nahi => kuch mat karo
    if ([name, phone, email].every((v) => v === undefined)) continue;

    // teeno khali => contact row hata do
    if ([name, phone, email].every(isEmpty)) {
      await conn.execute(
        `DELETE FROM vendor_contacts WHERE vendor_id = ? AND role = ?`,
        [vendorId, role],
      );
      continue;
    }

    await conn.execute(
      `INSERT INTO vendor_contacts (vendor_id, role, name, phone, email)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name), phone = VALUES(phone), email = VALUES(email)`,
      [vendorId, role, toNull(name), toNull(phone), toNull(email)],
    );
  }

  // documents (Cloudinary URLs) -> vendor_documents
  for (const [key, docType] of Object.entries(DOC_TYPE_MAP)) {
    const url = data[key];

    // khali / bheja hi nahi => purana document waise hi rehne do
    if (isEmpty(url)) continue;

    await conn.execute(
      `INSERT INTO vendor_documents (vendor_id, doc_type, file_path)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE file_path = VALUES(file_path), uploaded_at = NOW()`,
      [vendorId, docType, url],
    );
  }
};

export const saveVendorDocumentModel = async (vendorId, docKey, filePath) => {
  const docType = DOC_TYPE_MAP[docKey];
  if (!docType) throw new Error(`Invalid document key: ${docKey}`);

  const [result] = await pool.execute(
    `INSERT INTO vendor_documents (vendor_id, doc_type, file_path)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE file_path = VALUES(file_path), uploaded_at = NOW()`,
    [vendorId, docType, filePath],
  );
  return result;
};

/* ---------- Models ---------- */

export const findVendorById = async (id) => {
  const [rows] = await pool.execute(`SELECT * FROM vendors WHERE id = ?`, [id]);
  return rows[0] || null;
};

export const createVendorModel = async (data) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [res] = await conn.execute(
      `INSERT INTO vendors (vender_code, name, short_name, email, phone)
       VALUES (?, ?, ?, ?, ?)`,
      [
        toNull(data.vender_code),
        toNull(data.name),
        toNull(data.shortName),
        toNull(data.email),
        toNull(data.phone),
      ],
    );
    const vendorId = res.insertId;

    await saveRelated(conn, vendorId, data);

    await conn.commit();
    return { id: vendorId, insertId: vendorId, affectedRows: 1 };
  } catch (error) {
    await conn.rollback();
    console.error("Error in createVendorModel:", error);
    throw error;
  } finally {
    conn.release();
  }
};

export const updateVendorModel = async (id, data) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [exists] = await conn.execute(`SELECT id FROM vendors WHERE id = ?`, [
      id,
    ]);
    if (!exists.length) {
      await conn.rollback();
      return { affectedRows: 0 };
    }

    // core table
    const core = {
      name: data.name,
      short_name: data.shortName,
      email: data.email,
      phone: data.phone,
    };

    const entries = Object.entries(core).filter(([, v]) => v !== undefined);
    const sets = entries.map(([k]) => `${k} = ?`);
    sets.push("updated_at = NOW()");

    await conn.execute(`UPDATE vendors SET ${sets.join(", ")} WHERE id = ?`, [
      ...entries.map(([, v]) => toNull(v)),
      id,
    ]);

    await saveRelated(conn, id, data);

    await conn.commit();
    return { affectedRows: 1 };
  } catch (error) {
    await conn.rollback();
    console.error("Error in updateVendorModel:", error);
    throw error;
  } finally {
    conn.release();
  }
};

export const getAllVendorsModel = async () => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        v.id, v.vender_code, v.name, v.email, v.phone, v.short_name,
        v.status, v.verification,
        v.created_at, v.updated_at,
        vc.company_name, vc.company_type, vc.gst_number,
        vp.personal_city, vp.personal_state,
        oc.name AS owner_name
      FROM vendors v
      LEFT JOIN vendor_companies vc ON vc.vendor_id = v.id
      LEFT JOIN vendor_personal  vp ON vp.vendor_id = v.id
      LEFT JOIN vendor_contacts  oc ON oc.vendor_id = v.id AND oc.role = 'owner'
      ORDER BY v.id DESC
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
      v.id, v.vender_code, v.name, v.short_name, v.email, v.phone,
v.status, v.verification,
v.created_at, v.updated_at,
        vp.address, vp.personal_address, vp.personal_city,
        vp.personal_state, vp.aadhaar_number,
        vc.company_name, vc.company_type, vc.company_pan_number,
        vc.company_registered_number, vc.gst_number, vc.business_number,
        vc.registered_address, vc.garage_address, vc.garage_phone,
        vc.company_state, vc.company_city,
        vc.cooperative_name, vc.cooperative_number
      FROM vendors v
      LEFT JOIN vendor_personal  vp ON vp.vendor_id = v.id
      LEFT JOIN vendor_companies vc ON vc.vendor_id = v.id
      WHERE v.id = ?
      `,
      [id],
    );

    if (!rows.length) return null;
    const vendor = rows[0];

    const [contactRows] = await pool.execute(
      `SELECT role, name, phone, email FROM vendor_contacts WHERE vendor_id = ?`,
      [id],
    );
    const contact = Object.fromEntries(contactRows.map((c) => [c.role, c]));

    const [docRows] = await pool.execute(
      `SELECT doc_type, file_path FROM vendor_documents WHERE vendor_id = ?`,
      [id],
    );
    const docByType = Object.fromEntries(
      docRows.map((d) => [d.doc_type, d.file_path]),
    );
    const docs = Object.fromEntries(
      Object.entries(DOC_TYPE_MAP).map(([key, type]) => [
        key,
        docByType[type] ?? null,
      ]),
    );

    return {
      id: vendor.id,
      venderCode: vendor.vender_code,
      status: vendor.status,
      verification: vendor.verification,
      createdAt: vendor.created_at,
      updatedAt: vendor.updated_at,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,

      companyName: vendor.company_name,
      companyType: vendor.company_type,
      companyPanNumber: vendor.company_pan_number,
      companyRegisteredNumber: vendor.company_registered_number,
      gstNumber: vendor.gst_number,
      businessNumber: vendor.business_number,

      ownerName: contact.owner?.name ?? null,
      ownerPhone: contact.owner?.phone ?? null,
      ownerEmail: contact.owner?.email ?? null,

      shortName: vendor.short_name,
      cooperativeName: vendor.cooperative_name,
      cooperativeNumber: vendor.cooperative_number,

      registeredAddress: vendor.registered_address,
      garageAddress: vendor.garage_address,
      garagePhone: vendor.garage_phone,

      managerName1: contact.ops_manager?.name ?? null,
      managerPhone1: contact.ops_manager?.phone ?? null,
      managerEmail1: contact.ops_manager?.email ?? null,
      managerName2: contact.accountant?.name ?? null,
      managerPhone2: contact.accountant?.phone ?? null,
      managerEmail2: contact.accountant?.email ?? null,

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

      ...docs, // passportPhoto, panDoc, adharDoc, gstDoc, vendorProof, vehicleDoc
    };
  } catch (error) {
    console.error("Error in getVendorByIdModel:", error);
    throw error;
  }
};

export const updateVendorStatusModel = async (id, status) => {
  const [result] = await pool.execute(
    `UPDATE vendors SET status = ?, updated_at = NOW() WHERE id = ?`,
    [status, id],
  );
  return result;
};

export const deleteVendorModel = async (id) => {
  // vendor_personal / companies / contacts / documents ON DELETE CASCADE se apne aap hat jayenge
  const [result] = await pool.execute(`DELETE FROM vendors WHERE id = ?`, [id]);
  return result;
};

export const getAllAccessCitiesModel = async () => {
  const [rows] = await pool.execute(
    `SELECT id, city_name, zone_id, created_at, updated_at
     FROM city
     ORDER BY city_name ASC`,
  );
  return rows;
};
export const updateVendorVerificationModel = async (id, verification) => {
  const [result] = await pool.execute(
    `UPDATE vendors SET verification = ?, updated_at = NOW() WHERE id = ?`,
    [verification, id],
  );
  return result;
};
