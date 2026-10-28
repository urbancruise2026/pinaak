import { pool } from "../../config/mySqlDB.js";

export const getActiveChargeTemplatesModel = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT id, charge_name, charge_detail, sort_order
       FROM charge_templates
       WHERE is_active = 1
       ORDER BY sort_order ASC`,
    );

    return rows;
  } catch (error) {
    console.error("getActiveChargeTemplatesModel error:", error);
    throw error;
  }
};

export const getActiveNoteTemplatesModel = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT id, note_text, sort_order
       FROM note_templates
       WHERE is_active = 1
       ORDER BY sort_order ASC`,
    );

    return rows;
  } catch (error) {
    console.error("getActiveNoteTemplatesModel error:", error);
    throw error;
  }
};

export const createQuotationModel = async (data, createdBy) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const tempQuoteNo = `TMP-${Date.now()}`;

    const [quotationResult] = await connection.query(
      `
      INSERT INTO quotations (
        quote_no, customer_id, lead_id, quote_date, valid_till,
        travel_detail, pickup_location, pickup_time, drop_location, drop_time,
        travel_from, travel_to, total_days, trip_type, pax,
        remarks, offer_text, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        tempQuoteNo,
        data.customer_id,
        data.lead_id ?? null,
        data.quote_date ?? new Date(),
        data.valid_till ?? null,
        data.travel_detail ?? null,
        data.pickup_location ?? null,
        data.pickup_time ?? null,
        data.drop_location ?? null,
        data.drop_time ?? null,
        data.travel_from ?? null,
        data.travel_to ?? null,
        data.total_days ?? null,
        data.trip_type ?? null,
        data.pax ?? null,
        data.remarks ?? null,
        data.offer_text ?? null,
        (data.status || "DRAFT").toUpperCase(),
        createdBy ?? null,
      ],
    );

    const quotationId = quotationResult.insertId;

    // Final quote_no: QT-2026-00001
    const quoteNo = `QT-${new Date().getFullYear()}-${String(quotationId).padStart(5, "0")}`;
    await connection.query(`UPDATE quotations SET quote_no = ? WHERE id = ?`, [
      quoteNo,
      quotationId,
    ]);

    if (data.notes?.length) {
      const noteRows = data.notes.map((n, i) => [
        quotationId,
        n.note_text,
        n.sort_order ?? i + 1,
      ]);
      await connection.query(
        `INSERT INTO quotation_notes (quotation_id, note_text, sort_order) VALUES ?`,
        [noteRows],
      );
    }

    if (data.other_charges?.length) {
      const chargeRows = data.other_charges.map((c, i) => [
        quotationId,
        c.charge_name,
        c.charge_detail ?? null,
        c.is_included ? 1 : 0,
        c.sort_order ?? i + 1,
      ]);
      await connection.query(
        `INSERT INTO quotation_other_charges
           (quotation_id, charge_name, charge_detail, is_included, sort_order)
         VALUES ?`,
        [chargeRows],
      );
    }

    if (data.vehicle_options?.length) {
      for (let i = 0; i < data.vehicle_options.length; i++) {
        const opt = data.vehicle_options[i];
        const srNo = opt.sr_no ?? i + 1;

        const [optResult] = await connection.query(
          `
          INSERT INTO quotation_vehicle_options (
            quotation_id, sr_no, vehicle_manager_id, seats, vehicle_name,
            category_name, no_of_vehicles, description, discounted_price
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [
            quotationId,
            srNo,
            opt.vehicle_manager_id ?? null,
            opt.seats ?? null,
            opt.vehicle_name ?? null,
            opt.category_name ?? null,
            opt.no_of_vehicles ?? 1,
            opt.description ?? null,
            opt.discounted_price ?? 0,
          ],
        );

        const optionId = optResult.insertId;

        if (opt.vehicles?.length) {
          const vehicleRows = opt.vehicles.map((v, j) => [
            quotationId,
            optionId,
            v.sr_no ?? j + 1,
            v.vehicle_manager_id ?? null,
            v.vehicle_number ?? null,
            v.vehicle_name ?? null,
            v.seats ?? null,
            v.driver_name ?? null,
            v.driver_phone ?? null,
            v.price ?? 0,
            v.remarks ?? null,
          ]);
          await connection.query(
            `
            INSERT INTO quotation_vehicle_options_2 (
              quotation_id, option_id, sr_no, vehicle_manager_id, vehicle_number,
              vehicle_name, seats, driver_name, driver_phone, price, remarks
            ) VALUES ?
            `,
            [vehicleRows],
          );
        }
      }
    }

    await connection.commit();

    return { id: quotationId, quote_no: quoteNo };
  } catch (error) {
    await connection.rollback();
    console.error("createQuotationModel error:", error);
    throw error;
  } finally {
    connection.release();
  }
};

export const getRateQuotationByLeadId = async (leadId) => {
  const [rows] = await pool.execute(
    `SELECT * FROM rate_quotations WHERE lead_id = ? LIMIT 1`,
    [leadId],
  );

  if (!rows.length) return null;

  const quotation = rows[0];

  return {
    ...quotation,
    vehicles:
      typeof quotation.vehicles === "string"
        ? JSON.parse(quotation.vehicles || "[]")
        : quotation.vehicles || [],
  };
};
