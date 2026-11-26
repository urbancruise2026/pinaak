import { hrmsPool, pool } from "../../config/mySqlDB.js";
// username/password add karne par: import bcrypt from "bcrypt";

const toNull = (val) =>
  val === "" || val === undefined || val === null ? null : val;

// array aaye to "bus,cab" string bana do, warna jaisa hai waisa
const toCategory = (v) => (Array.isArray(v) ? v.join(",") : v);

const isEmpty = (v) => v === undefined || v === null || v === "";

// form ke document keys -> vendor_documents.doc_type
const DOC_TYPE_MAP = {
  passportPhoto: "passport_photo",
  panDoc: "pan",
  adharDoc: "aadhaar",
  gstDoc: "gst",
  vendorProof: "vendor_proof",
  vendorProof2: "vendor_proof_2",
  vehicleDoc: "vehicle",
};

const CONTACT_ROLES = [
  ["owner", "ownerName", "ownerPhone", "ownerEmail"],
  ["ops_manager", "managerName1", "managerPhone1", "managerEmail1"],
  ["accountant", "managerName2", "managerPhone2", "managerEmail2"],
];

// 1:many tables ka mapping  { form key: db column }
const COMPANY_FIELD_MAP = {
  companyName: "company_name",
  companyType: "company_type",
  companyPanNumber: "company_pan_number",
  companyRegisteredNumber: "company_registered_number",
  gstNumber: "gst_number",
  businessNumber: "business_number",
  registeredAddress: "registered_address",
  cooperativeName: "cooperative_name",
  cooperativeNumber: "cooperative_number",
  // har company ki apni bank details
  bankName: "bank_name",
  bankAccountNumber: "bank_account_number",
  accountHolderName: "account_holder_name",
  ifscCode: "ifsc_code",
  cancelledCheque: "cancelled_cheque",
};

const GARAGE_FIELD_MAP = {
  garageAddress: "garage_address",
  garageManager: "garage_manager",
  garagePhone: "garage_phone",
};

/* ---------- Helpers ---------- */

// 1:1 table (vendor_personal / vendor_bank_details) me insert ya update.
// In tables me vendor_id par UNIQUE key honi chahiye.
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

// 1:many table (vendor_companies / vendor_garages) sync karta hai
// - rows undefined / array nahi => kuch mat karo
// - id wali row => update, bina id wali => insert
// - jo row ab list me nahi hai => delete
// (table name aur fieldMap sirf internal constants se aate hain)
const syncChildren = async (conn, table, vendorId, rows, fieldMap) => {
  if (!Array.isArray(rows)) return;

  const keys = Object.keys(fieldMap);
  const cols = Object.values(fieldMap);
  const keepIds = [];

  for (const row of rows) {
    if (!keys.some((k) => !isEmpty(row[k]))) continue; // poori khali row skip

    const values = keys.map((k) => toNull(row[k]));

    if (row.id) {
      const [res] = await conn.execute(
        `UPDATE ${table}
         SET ${cols.map((c) => `${c} = ?`).join(", ")}
         WHERE id = ? AND vendor_id = ?`,
        [...values, row.id, vendorId],
      );
      if (res.affectedRows) {
        keepIds.push(Number(row.id));
        continue;
      }
    }

    const [ins] = await conn.execute(
      `INSERT INTO ${table} (vendor_id, ${cols.join(", ")})
       VALUES (?, ${cols.map(() => "?").join(", ")})`,
      [vendorId, ...values],
    );
    keepIds.push(ins.insertId);
  }

  // list me jo nahi aayi unhe hata do
  if (keepIds.length) {
    await conn.execute(
      `DELETE FROM ${table}
       WHERE vendor_id = ? AND id NOT IN (${keepIds.map(() => "?").join(",")})`,
      [vendorId, ...keepIds],
    );
  } else {
    await conn.execute(`DELETE FROM ${table} WHERE vendor_id = ?`, [vendorId]);
  }
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

  // multiple companies -> vendor_companies
  await syncChildren(
    conn,
    "vendor_companies",
    vendorId,
    data.companies,
    COMPANY_FIELD_MAP,
  );

  // multiple garages -> vendor_garages
  await syncChildren(
    conn,
    "vendor_garages",
    vendorId,
    data.garages,
    GARAGE_FIELD_MAP,
  );

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
      `INSERT INTO vendors (vender_code, name, short_name, email, phone, region, vendor_category)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        toNull(data.vender_code),
        toNull(data.name),
        toNull(data.shortName),
        toNull(data.email),
        toNull(data.phone),
        toNull(data.region),
        toNull(toCategory(data.vendorCategory)),
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
      region: data.region,
      vendor_category: toCategory(data.vendorCategory),
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
    // vendor ki multiple companies ho sakti hain, list me pehli company dikhate hain
    // (warna vendor ki rows duplicate ho jati)
    const [rows] = await pool.execute(`
      SELECT
        v.id, v.vender_code, v.name, v.email, v.phone, v.short_name,
        v.region, v.vendor_category,
        v.status, v.verification,
        v.created_at, v.updated_at,
        vc.company_name, vc.company_type, vc.gst_number,
        vp.personal_city, vp.personal_state,
        oc.name AS owner_name
      FROM vendors v
      LEFT JOIN vendor_companies vc
        ON vc.id = (
          SELECT MIN(c2.id) FROM vendor_companies c2 WHERE c2.vendor_id = v.id
        )
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
    // NOTE: vendor_companies aur vendor_garages yahan JOIN nahi hain
    // (1:many hain, rows duplicate ho jati) - unhe neeche alag fetch karte hain
    const [rows] = await pool.execute(
      `
      SELECT
        v.id, v.vender_code, v.name, v.short_name, v.email, v.phone,
        v.region, v.vendor_category,
        v.status, v.verification,
        v.created_at, v.updated_at,
        vp.address, vp.personal_address, vp.personal_city,
        vp.personal_state, vp.aadhaar_number
      FROM vendors v
      LEFT JOIN vendor_personal vp ON vp.vendor_id = v.id
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

    const [companyRows] = await pool.execute(
      `SELECT id, company_name, company_type, company_pan_number,
              company_registered_number, gst_number, business_number,
              registered_address, cooperative_name, cooperative_number,
              bank_name, bank_account_number, account_holder_name,
              ifsc_code, cancelled_cheque
       FROM vendor_companies WHERE vendor_id = ? ORDER BY id ASC`,
      [id],
    );
    const companies = companyRows.map((c) => ({
      id: c.id,
      companyName: c.company_name,
      companyType: c.company_type,
      companyPanNumber: c.company_pan_number,
      companyRegisteredNumber: c.company_registered_number,
      gstNumber: c.gst_number,
      businessNumber: c.business_number,
      registeredAddress: c.registered_address,
      cooperativeName: c.cooperative_name,
      cooperativeNumber: c.cooperative_number,
      bankName: c.bank_name,
      bankAccountNumber: c.bank_account_number,
      accountHolderName: c.account_holder_name,
      ifscCode: c.ifsc_code,
      cancelledCheque: c.cancelled_cheque,
    }));
    const firstCompany = companies[0] ?? {};

    const [garageRows] = await pool.execute(
      `SELECT id, garage_address, garage_manager, garage_phone
       FROM vendor_garages WHERE vendor_id = ? ORDER BY id ASC`,
      [id],
    );

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
      region: vendor.region,
      vendorCategory: vendor.vendor_category,

      // multiple companies (vendor_companies)
      companies,

      // purani screens ke liye: pehli company ke fields top level par bhi
      companyName: firstCompany.companyName ?? null,
      companyType: firstCompany.companyType ?? null,
      companyPanNumber: firstCompany.companyPanNumber ?? null,
      companyRegisteredNumber: firstCompany.companyRegisteredNumber ?? null,
      gstNumber: firstCompany.gstNumber ?? null,
      businessNumber: firstCompany.businessNumber ?? null,
      registeredAddress: firstCompany.registeredAddress ?? null,
      cooperativeName: firstCompany.cooperativeName ?? null,
      cooperativeNumber: firstCompany.cooperativeNumber ?? null,

      ownerName: contact.owner?.name ?? null,
      ownerPhone: contact.owner?.phone ?? null,
      ownerEmail: contact.owner?.email ?? null,

      shortName: vendor.short_name,

      // multiple garages (vendor_garages)
      garages: garageRows.map((g) => ({
        id: g.id,
        garageAddress: g.garage_address,
        garageManager: g.garage_manager,
        garagePhone: g.garage_phone,
      })),

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
  // vendor_personal / companies / garages / bank_details / contacts / documents
  // ON DELETE CASCADE se apne aap hat jayenge
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

export const getRegionByStateIdModel = async (stateId) => {
  try {
    // 1) state: pinaak database wale pool se
    const [stateRows] = await pool.execute(
      `SELECT id, stateName, region_id FROM states WHERE id = ?`,
      [stateId],
    );
    const state = stateRows[0];
    if (!state) return null;

    // 2) region: saarthi database wale hrmsPool se
    let regionName = null;
    if (state.region_id) {
      const [regionRows] = await hrmsPool.execute(
        `SELECT region_name FROM regions WHERE id = ?`,
        [state.region_id],
      );
      regionName = regionRows[0]?.region_name ?? null;
    }

    return {
      state_id: state.id,
      stateName: state.stateName,
      region_id: state.region_id,
      region_name: regionName,
    };
  } catch (error) {
    console.error("Error in getRegionByStateIdModel:", error);
    throw error;
  }
};

/* ---------- Missing fields check ---------- */

// ye columns check nahi karne (system columns)
const SKIP_COLS = new Set([
  "id",
  "vendor_id",
  "created_at",
  "updated_at",
  "uploaded_at",
]);

const isBlank = (v) =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "");

// row ke wo column names jo null / empty hain
const blankCols = (row, extraSkip = []) =>
  Object.keys(row).filter(
    (k) => !SKIP_COLS.has(k) && !extraSkip.includes(k) && isBlank(row[k]),
  );

const groupBy = (rows, key = "vendor_id") => {
  const map = new Map();
  for (const r of rows) {
    if (!map.has(r[key])) map.set(r[key], []);
    map.get(r[key]).push(r);
  }
  return map;
};

// vendorId diya to sirf ek vendor, warna saare vendors
export const getVendorsMissingFieldsModel = async (vendorId = null) => {
  try {
    const where = vendorId ? "WHERE id = ?" : "";
    const childWhere = vendorId ? "WHERE vendor_id = ?" : "";
    const params = vendorId ? [vendorId] : [];

    const [vendors] = await pool.execute(
      `SELECT * FROM vendors ${where} ORDER BY id DESC`,
      params,
    );
    const [personal] = await pool.execute(
      `SELECT * FROM vendor_personal ${childWhere}`,
      params,
    );
    const [companies] = await pool.execute(
      `SELECT * FROM vendor_companies ${childWhere} ORDER BY id`,
      params,
    );
    const [garages] = await pool.execute(
      `SELECT * FROM vendor_garages ${childWhere} ORDER BY id`,
      params,
    );
    const [contacts] = await pool.execute(
      `SELECT * FROM vendor_contacts ${childWhere}`,
      params,
    );
    const [docs] = await pool.execute(
      `SELECT * FROM vendor_documents ${childWhere}`,
      params,
    );

    const personalMap = new Map(personal.map((p) => [p.vendor_id, p]));
    const companyMap = groupBy(companies);
    const garageMap = groupBy(garages);
    const contactMap = groupBy(contacts);
    const docMap = groupBy(docs);

    return vendors.map((v) => {
      // 1) vendors table
      const vendorMissing = blankCols(v);

      // 2) vendor_personal (1:1)
      const p = personalMap.get(v.id);
      const personalMissing = p ? blankCols(p) : ["(row hi nahi hai)"];

      // 3) vendor_companies (1:many)
      const companyList = companyMap.get(v.id) ?? [];
      const companiesMissing = companyList.map((c) => ({
        id: c.id,
        companyName: c.company_name,
        missing: blankCols(c),
      }));

      // 4) vendor_garages (1:many)
      const garageList = garageMap.get(v.id) ?? [];
      const garagesMissing = garageList.map((g) => ({
        id: g.id,
        garageAddress: g.garage_address,
        missing: blankCols(g),
      }));

      // 5) vendor_contacts (owner / ops_manager / accountant)
      const vContacts = contactMap.get(v.id) ?? [];
      const contactsMissing = {};
      for (const [role] of CONTACT_ROLES) {
        const c = vContacts.find((x) => x.role === role);
        contactsMissing[role] = c
          ? blankCols(c, ["role"])
          : ["(row hi nahi hai)"];
      }

      // 6) vendor_documents
      const vDocs = docMap.get(v.id) ?? [];
      const uploaded = new Set(
        vDocs.filter((d) => !isBlank(d.file_path)).map((d) => d.doc_type),
      );
      const documentsMissing = Object.values(DOC_TYPE_MAP).filter(
        (t) => !uploaded.has(t),
      );

      const result = {
        vendorId: v.id,
        venderCode: v.vender_code,
        name: v.name,
        missing: {
          vendor: vendorMissing,
          personal: personalMissing,
          companies: companyList.length
            ? companiesMissing
            : "(koi company nahi hai)",
          garages: garageList.length ? garagesMissing : "(koi garage nahi hai)",
          contacts: contactsMissing,
          documents: documentsMissing,
        },
      };

      // total count (summary / filter ke liye)
      result.totalMissing =
        vendorMissing.length +
        personalMissing.length +
        companiesMissing.reduce((s, c) => s + c.missing.length, 0) +
        garagesMissing.reduce((s, g) => s + g.missing.length, 0) +
        Object.values(contactsMissing).reduce((s, a) => s + a.length, 0) +
        documentsMissing.length;

      return result;
    });
  } catch (error) {
    console.error("Error in getVendorsMissingFieldsModel:", error);
    throw error;
  }
};