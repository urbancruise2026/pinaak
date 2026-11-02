import type { Calc, FormState, TripType } from "./types";

/* ---------- formatting ---------- */

export const num = (v: string) =>
  v === "" || isNaN(Number(v)) ? 0 : Number(v);

export const money = (n: number) => `Rs.${n.toLocaleString("en-IN")}/-`;

const ordinal = (d: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = d % 100;
  return d + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const fmtDate = (iso: string, withYear = true) => {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  const mon = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()];
  return `${ordinal(d.getDate())} ${mon}${withYear ? " " + d.getFullYear() : ""}`;
};

export const fmtTime = (t: string) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
};

/* ---------- dates ---------- */

export const daysBetween = (a: string, b: string) => {
  if (!a || !b) return 0;
  const diff =
    (new Date(b + "T00:00:00").getTime() -
      new Date(a + "T00:00:00").getTime()) /
    86400000;
  return diff < 0 ? 0 : Math.round(diff) + 1;
};

export const datesBetween = (a: string, b: string) => {
  const n = Math.min(daysBetween(a, b), 31);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(a + "T00:00:00");
    d.setDate(d.getDate() + i);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
};

/* ---------- auto calculations ---------- */

export const calculate = (form: FormState, isPersonal: boolean): Calc => {
  const total = num(form.totalCost);
  const customerCollect = isPersonal ? num(form.customerCollect) : 0;
  const collectFromUC = Math.max(total - customerCollect, 0);
  const advance = num(form.advance);
  return {
    totalDays: daysBetween(form.startDate, form.endDate),
    total,
    customerCollect,
    collectFromUC,
    advance,
    balance: Math.max(collectFromUC - advance, 0),
  };
};

/* ---------- validation ---------- */

export const validate = (
  form: FormState,
  isPersonal: boolean,
  calc: Calc,
): Record<string, string> => {
  const e: Record<string, string> = {};
  if (!form.vendorName.trim()) e.vendorName = "Vendor name is required";
  if (form.tripIds.length === 0) e.tripIds = "Add at least one Trip ID";
  if (!form.startDate) e.startDate = "Required";
  if (!form.endDate) e.endDate = "Required";
  if (form.startDate && form.endDate && form.endDate < form.startDate)
    e.endDate = "End date is before start date";
  if (!form.vehicleModel.trim()) e.vehicleModel = "Vehicle model is required";
  if (!form.totalCost) e.totalCost = "Total cost is required";
  if (isPersonal && calc.customerCollect > calc.total)
    e.customerCollect = "Cannot exceed total trip cost";
  if (calc.advance > calc.collectFromUC)
    e.advance = "Cannot exceed 'Collect from UC'";
  return e;
};

/* ---------- WhatsApp message ---------- */

export const buildMessage = (
  form: FormState,
  label: string,
  isPersonal: boolean,
  calc: Calc,
): string => {
  const { totalDays, total, customerCollect, collectFromUC, advance, balance } =
    calc;
  const L: string[] = [];
  L.push("🛡 *URBAN CRUISE* 🛡", "");
  L.push("🎖 *BOOKING ASSIGNMENT* 🎖", `   *${label}*`, "");
  L.push(`*To ${form.vendorName || "________"}*`);
  if (form.vendorCompany || form.vendorCity)
    L.push(
      `   *${[form.vendorCompany, form.vendorCity].filter(Boolean).join(", ")}*`,
    );
  L.push("");

  L.push("👉 *TRIP DETAILS-*");
  L.push(`*•Trip ID*- ${form.tripIds.join(" - ") || "________"}`);
  if (form.startDate && form.endDate) {
    const same = form.startDate === form.endDate;
    L.push(
      `*•Travel Date*- ${fmtDate(form.startDate, false)}${same ? "" : " - " + fmtDate(form.endDate)} (${totalDays} Day${totalDays > 1 ? "s" : ""})`,
    );
  }
  if (isPersonal && (form.passengerName || form.passengerPhone))
    L.push(
      `*•Passenger*- ${[form.passengerName, form.passengerPhone].filter(Boolean).join(" | ")}`,
    );
  if (!isPersonal && (form.companyName || form.contactPerson))
    L.push(
      `*•Company*- ${[form.companyName, form.contactPerson, form.contactPhone].filter(Boolean).join(" | ")}`,
    );
  form.itinerary
    .filter((r) => r.date || r.pickupLocation || r.destinations)
    .forEach((r) => {
      const parts = [
        `*•Trip Detail*- ${fmtDate(r.date, false)}`,
        r.pickupTime || r.pickupLocation
          ? `Pick up - ${[fmtTime(r.pickupTime), r.pickupLocation].filter(Boolean).join(" ")}`
          : "",
        r.destinations
          ? `-> ${r.destinations}${form.purpose ? ` (${form.purpose})` : ""}`
          : "",
        r.dropLocation || r.dropTime
          ? `Drop -> ${[r.dropLocation, fmtTime(r.dropTime)].filter(Boolean).join(" - ")}`
          : "",
      ].filter(Boolean);
      L.push(parts.join(" | "));
    });
  L.push("");

  L.push("🚌 *VEHICLE DETAILS-*");
  const veh = [
    form.seats ? `${form.seats} Seat` : "",
    form.vehicleModel,
    form.ac ? "A/C" : "Non A/C",
  ]
    .filter(Boolean)
    .join(" | ");
  const vehExtra = [
    form.specialReq,
    num(form.vehicleCount) > 1 ? `${form.vehicleCount} Vehicles` : "",
  ]
    .filter(Boolean)
    .join(", ");
  L.push(`*•Veh. Model*- ${veh}${vehExtra ? ` (Required - ${vehExtra})` : ""}`);
  L.push(`*•Veh. No.*- ${form.vehicleNo}`);
  if (form.driverName || form.driverPhone)
    L.push(
      `*•Driver*- ${[form.driverName, form.driverPhone].filter(Boolean).join(" | ")}`,
    );
  L.push("");

  L.push("👉 *TRIP AMOUNT-*");
  L.push(
    `• *Total Trip Cost*- ${money(total)} (${[
      form.inclusions,
      totalDays ? `for ${totalDays} Days` : "",
      !isPersonal && form.kmLimit ? `${form.kmLimit} kms` : "",
      !isPersonal ? form.pickupBasis : "",
    ]
      .filter(Boolean)
      .join(", ")})`,
  );
  if (isPersonal) L.push(`• *Collect from Customer*- ${money(customerCollect)}`);
  L.push(
    `• *Collect from UC*- ${money(collectFromUC)} (Advance payment- ${money(advance)} | Balance- ${balance ? money(balance) : "Nill"})`,
  );
  L.push("");

  L.push(`*1. Parking*- ${form.parking || "—"}`);
  L.push(
    `*2. Extra Km*- ${form.extraKm ? `Rs. ${form.extraKm}/km` : "Nill"} | *Extra Hr.*- ${form.extraHr ? `Rs. ${form.extraHr}/hr` : "Nill"}`,
  );
  L.push(
    `*3. DA after ${form.daAfterTime || "11pm"}*- Rs. ${form.daAmount || 0}${form.daPerHourAfter1Am ? ` | After 1 am- Rs. ${form.daPerHourAfter1Am}/Hr.` : ""}`,
  );
  if (form.notes) L.push("", `*Note*- ${form.notes}`);
  return L.join("\n");
};

/* ---------- table summary (right-hand preview) ---------- */

export const buildSummary = (
  form: FormState,
  label: string,
  isPersonal: boolean,
  calc: Calc,
): Array<[string, string]> => {
  const rows: Array<[string, string]> = [];
  const add = (k: string, v: string) => v && rows.push([k, v]);
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  add("Trip type", label);
  add(
    "Assigned to",
    [form.vendorName, form.vendorCompany, form.vendorCity]
      .filter(Boolean)
      .join(", "),
  );
  add("Trip ID", form.tripIds.join(", "));
  if (form.startDate && form.endDate)
    add(
      "Travel date",
      `${fmtDate(form.startDate, false)} – ${fmtDate(form.endDate)} (${calc.totalDays} day${calc.totalDays > 1 ? "s" : ""})`,
    );
  if (isPersonal)
    add(
      "Passenger",
      [form.passengerName, form.passengerPhone].filter(Boolean).join(" | "),
    );
  else
    add(
      "Client",
      [form.companyName, form.contactPerson, form.contactPhone]
        .filter(Boolean)
        .join(" | "),
    );
  add(
    "Itinerary",
    form.itinerary
      .filter((r) => r.date || r.pickupLocation || r.destinations)
      .map(
        (r) =>
          `${fmtDate(r.date, false)}: ${[
            [fmtTime(r.pickupTime), r.pickupLocation].filter(Boolean).join(" "),
            r.destinations,
            [r.dropLocation, fmtTime(r.dropTime)].filter(Boolean).join(" "),
          ]
            .filter(Boolean)
            .join(" → ")}`,
      )
      .join("\n"),
  );
  add(
    "Vehicle",
    [
      form.seats ? `${form.seats} Seat` : "",
      form.vehicleModel,
      form.ac ? "A/C" : "Non A/C",
      num(form.vehicleCount) > 1 ? `${form.vehicleCount} vehicles` : "",
      form.specialReq,
    ]
      .filter(Boolean)
      .join(" | "),
  );
  add("Vehicle no.", form.vehicleNo);
  add(
    "Driver",
    [form.driverName, form.driverPhone].filter(Boolean).join(" | "),
  );
  add("Total cost", calc.total ? inr(calc.total) : "");
  if (isPersonal && calc.customerCollect)
    add("From customer", inr(calc.customerCollect));
  if (calc.total) {
    add("Collect from UC", inr(calc.collectFromUC));
    add("Advance", inr(calc.advance));
    add("Balance", calc.balance ? inr(calc.balance) : "Nill");
  }
  add("Parking", form.parking);
  add(
    "Extra km / hr",
    `${form.extraKm ? `₹${form.extraKm}/km` : "Nill"} / ${form.extraHr ? `₹${form.extraHr}/hr` : "Nill"}`,
  );
  add(
    `DA after ${form.daAfterTime || "11 PM"}`,
    `₹${form.daAmount || 0}${form.daPerHourAfter1Am ? ` (after 1 AM ₹${form.daPerHourAfter1Am}/hr)` : ""}`,
  );
  add("Notes", form.notes);
  return rows;
};

/* ---------- backend payload ---------- */

export const buildPayload = (
  form: FormState,
  tripType: TripType,
  calc: Calc,
  message: string,
) => {
  const common = {
    tripType,
    vendor: {
      name: form.vendorName,
      company: form.vendorCompany,
      city: form.vendorCity,
    },
    tripIds: form.tripIds,
    startDate: form.startDate,
    endDate: form.endDate,
    totalDays: calc.totalDays,
    purpose: form.purpose,
    itinerary: form.itinerary,
    vehicle: {
      model: form.vehicleModel,
      seats: num(form.seats),
      count: num(form.vehicleCount) || 1,
      ac: form.ac,
      specialReq: form.specialReq,
      vehicleNo: form.vehicleNo,
      driverName: form.driverName,
      driverPhone: form.driverPhone,
    },
    amount: {
      totalCost: calc.total,
      inclusions: form.inclusions,
      collectFromUC: calc.collectFromUC,
      advance: calc.advance,
      balance: calc.balance,
    },
    terms: {
      parking: form.parking,
      extraKmRate: num(form.extraKm),
      extraHrRate: num(form.extraHr),
      daAfterTime: form.daAfterTime,
      daAmount: num(form.daAmount),
      daPerHourAfter1Am: num(form.daPerHourAfter1Am),
      notes: form.notes,
    },
    generatedMessage: message,
  };

  return tripType === "personal"
    ? {
        ...common,
        personal: {
          passengerName: form.passengerName,
          passengerPhone: form.passengerPhone,
          collectFromCustomer: calc.customerCollect,
        },
      }
    : {
        ...common,
        corporate: {
          companyName: form.companyName,
          contactPerson: form.contactPerson,
          contactPhone: form.contactPhone,
          kmLimit: num(form.kmLimit),
          pickupBasis: form.pickupBasis,
        },
      };
};
