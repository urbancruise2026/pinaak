import { RULES } from "./constants";
import {
  daysBetween,
  fmtDate,
  fmtTime,
  money,
  num,
} from "../booking-assignment/utils";
import type { Calc, DutyLeg, FormState, TripType } from "./types";

export { num, money, fmtDate, fmtTime, daysBetween };

/* ---------- small formatters ---------- */

export const ordinal = (d: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = d % 100;
  return d + (s[(v - 20) % 10] || s[v] || s[0]);
};

/** "07:00" -> "Morning" (matches the wording used on your slips) */
export const dayPart = (t: string) => {
  if (!t) return "";
  const h = Number(t.split(":")[0]);
  if (h < 4) return "Night";
  if (h < 7) return "Early Morning";
  if (h < 12) return "Morning";
  if (h < 16) return "Afternoon";
  if (h < 20) return "Evening";
  return "Night";
};

/** "07:00" -> "7:00 AM - Morning" */
export const timeLabel = (t: string) =>
  t ? `${fmtTime(t)} - ${dayPart(t)}` : "";

/** Multi-line points -> "(1) A and (2) B" (single point stays plain) */
export const pointsText = (s: string) => {
  const lines = s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length <= 1) return lines[0] ?? "";
  return lines.map((l, i) => `(${i + 1}) ${l}`).join(" and ");
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const plain = (s: string) => s.replace(/\*/g, "");

export const activeRules = (form: FormState, tripType: TripType) =>
  RULES.filter((r) => (!r.only || r.only === tripType) && form.rules[r.key]);

/* ---------- auto calculations ---------- */

export const calculate = (form: FormState, isPersonal: boolean): Calc => {
  const total = num(form.totalCost);
  const advance = isPersonal ? 0 : num(form.bookingAdvance);
  const installmentsTotal = form.installments.reduce(
    (s, i) => s + num(i.amount),
    0,
  );
  const allocated = advance + installmentsTotal;
  return {
    totalDays: daysBetween(form.startDate, form.endDate),
    total,
    advance,
    installmentsTotal,
    allocated,
    unallocated: total - allocated,
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
  if (!form.legs.some((l) => l.pickupLocations.trim() && l.destinations.trim()))
    e.legs = "Add at least one leg with a pick-up point and destination";
  if (!form.vehicleModel.trim()) e.vehicleModel = "Vehicle model is required";
  if (!form.customerName.trim()) e.customerName = "Customer name is required";
  if (!form.customerPhone.trim()) e.customerPhone = "Customer phone is required";
  if (!form.pickupAddress.trim()) e.pickupAddress = "Pick-up address is required";
  if (!form.totalCost) e.totalCost = "Total amount is required";
  if (
    calc.installmentsTotal > 0 &&
    calc.total > 0 &&
    calc.unallocated !== 0
  )
    e.installments = `${isPersonal ? "Instalments" : "Advance + instalments"} (${inr(calc.allocated)}) must equal the total (${inr(calc.total)})`;
  if (!isPersonal && calc.advance > calc.total)
    e.bookingAdvance = "Cannot exceed total";
  return e;
};

/* ---------- WhatsApp message ---------- */

const legLine = (l: DutyLeg, purpose: string) => {
  const vehNo = Number(l.vehicle);
  const veh = l.vehicle.trim()
    ? `Veh.- ${vehNo ? ordinal(vehNo) : l.vehicle.trim()} -> `
    : "";
  const dropDate =
    l.dropDate && l.dropDate !== l.date ? fmtDate(l.dropDate, false) : "";
  return [
    ` *▪️Trip Detail*- ${fmtDate(l.date, false)}`,
    ` - ${veh}Pick up - ${timeLabel(l.pickupTime)}`,
    l.pickupLocations ? ` - ${pointsText(l.pickupLocations)}` : "",
    l.destinations
      ? ` -> ${l.destinations}${purpose ? ` (${purpose})` : ""}`
      : "",
    l.dropLocations ? `  - Drop -> ${pointsText(l.dropLocations)}` : "",
    l.dropTime ? ` - ${timeLabel(l.dropTime)}` : "",
    dropDate ? ` - ${dropDate}` : "",
  ].join("");
};

export const buildMessage = (
  form: FormState,
  tripType: TripType,
  calc: Calc,
): string => {
  const isPersonal = tripType === "personal";
  const label = isPersonal ? "Personal" : "Corporate";
  const L: string[] = [];

  L.push("🔰 *URBAN CRUISE* 🔰", "");
  L.push(`*To ${form.vendorName || "________"}*`);
  if (form.vendorCompany || form.vendorCity)
    L.push(
      `     *${[form.vendorCompany, form.vendorCity].filter(Boolean).join(", ")}*`,
    );
  L.push("", `🌻 *DUTY SLIP (${label})* 🌻`, "");

  /* trip details */
  L.push("👉 *TRIP DETAILS-*");
  L.push(` *▪️Trip no.*- ${form.tripIds.join(" - ") || "________"}`);
  if (form.startDate && form.endDate) {
    const same = form.startDate === form.endDate;
    L.push(
      ` *▪️Travel Date*- ${fmtDate(form.startDate, false)}${same ? "" : " - " + fmtDate(form.endDate)} (for ${calc.totalDays} Day${calc.totalDays > 1 ? "s" : ""})`,
    );
  }
  form.legs
    .filter((l) => l.date || l.pickupLocations || l.destinations)
    .forEach((l) => L.push(legLine(l, form.purpose)));
  L.push("");

  /* vehicle */
  const veh = [
    form.seats ? `${form.seats} Seat` : "",
    form.vehicleModel,
    form.ac ? "A/c" : "Non A/c",
  ]
    .filter(Boolean)
    .join(" | ");
  const vehExtra = [
    form.specialReq,
    !isPersonal && num(form.vehicleCount) > 1
      ? `${form.vehicleCount} Vehicles`
      : "",
  ]
    .filter(Boolean)
    .join(") ( Required - ");
  L.push(
    ` *▪️Vehicle Model*- ${veh}${vehExtra ? `  (Required - ${vehExtra})` : ""}`,
  );
  L.push(` *▪️Vehicle No.*- ${form.vehicleNo}`, "");

  /* customer */
  L.push("👉 *CUSTOMER DETAILS-*");
  L.push(
    ` *▪️Customer*- ${[form.customerName, form.customerPhone].filter(Boolean).join(" - ")}`,
  );
  L.push(` *▪️Pick-up Address*- ${form.pickupAddress}`);
  L.push(` *▪️Google Map Link*- ${form.mapLink}`);
  L.push(` *▪️Pick-up Time*- ${timeLabel(form.pickupTime)}`, "");

  /* payment */
  L.push(`👉 *COLLECT FROM ${isPersonal ? "CUSTOMER" : "UC"}-*`);
  L.push(
    ` *1. ${money(calc.total)}* (${[
      form.inclusions,
      calc.totalDays ? `for ${calc.totalDays} Days` : "",
      !isPersonal && form.kmLimit ? `${form.kmLimit} kms` : "",
      form.billingBasis,
    ]
      .filter(Boolean)
      .join(", ")})`,
  );
  if (!isPersonal && calc.advance)
    L.push(`     ▪️ *Booking Advance Paid*- ${money(calc.advance)}`);
  form.installments
    .filter((i) => i.date && num(i.amount) > 0)
    .forEach((i) =>
      L.push(`     ▪️ *${fmtDate(i.date, false)}*- ${money(num(i.amount))}`),
    );
  L.push(` *2. Parking${isPersonal ? "" : "/Entry"}*- ${form.parking}`);
  L.push(
    ` *3. Extra km*- ${form.extraKm ? `Rs.${form.extraKm}/km` : "Nill"} | *Extra Hr.*- ${form.extraHr ? `Rs.${form.extraHr}/hr` : "Nill"}`,
  );
  L.push(
    ` *4. DA after ${form.daAfterTime || "11pm"}*- Rs. ${num(form.daAmount).toLocaleString("en-IN")}${form.daPerHourAfter1Am ? ` | *After 1 am*- Rs. ${num(form.daPerHourAfter1Am).toLocaleString("en-IN")}/Hr.` : ""}`,
    "",
  );

  /* instructions */
  activeRules(form, tripType).forEach((r) => L.push(`👉 ${r.text}`));
  if (form.notes.trim()) L.push(`👉 ${form.notes.trim()}`);

  /* sender */
  L.push("_________________________________");
  L.push(
    ` *${form.senderName}*  |  ☎  *${form.senderPhone}*`,
    `*URBAN CRUISE | ${form.senderCity}*`,
  );
  return L.join("\n");
};

/* ---------- table summary (right-hand panel) ---------- */

export const buildSummary = (
  form: FormState,
  tripType: TripType,
  calc: Calc,
): Array<[string, string]> => {
  const isPersonal = tripType === "personal";
  const rows: Array<[string, string]> = [];
  const add = (k: string, v: string) => v && rows.push([k, v]);

  add("Slip type", isPersonal ? "Personal" : "Corporate");
  add(
    "Assigned to",
    [form.vendorName, form.vendorCompany, form.vendorCity]
      .filter(Boolean)
      .join(", "),
  );
  add("Trip no.", form.tripIds.join(", "));
  if (form.startDate && form.endDate)
    add(
      "Travel date",
      `${fmtDate(form.startDate, false)} – ${fmtDate(form.endDate)} (${calc.totalDays} day${calc.totalDays > 1 ? "s" : ""})`,
    );
  add(
    "Trip legs",
    form.legs
      .filter((l) => l.date || l.pickupLocations || l.destinations)
      .map((l) =>
        [
          [l.vehicle ? `Veh ${l.vehicle}` : "", fmtDate(l.date, false)]
            .filter(Boolean)
            .join(" "),
          [fmtTime(l.pickupTime), pointsText(l.pickupLocations)]
            .filter(Boolean)
            .join(" "),
          l.destinations,
          [pointsText(l.dropLocations), fmtTime(l.dropTime)]
            .filter(Boolean)
            .join(" "),
        ]
          .filter(Boolean)
          .join(" → "),
      )
      .join("\n"),
  );
  add(
    "Vehicle",
    [
      form.seats ? `${form.seats} Seat` : "",
      form.vehicleModel,
      form.ac ? "A/c" : "Non A/c",
      !isPersonal && num(form.vehicleCount) > 1
        ? `${form.vehicleCount} vehicles`
        : "",
      form.specialReq,
    ]
      .filter(Boolean)
      .join(" | "),
  );
  add("Vehicle no.", form.vehicleNo);
  add(
    "Customer",
    [form.customerName, form.customerPhone].filter(Boolean).join(" - "),
  );
  add("Pick-up", [timeLabel(form.pickupTime), form.pickupAddress].filter(Boolean).join("\n"));
  add("Map link", form.mapLink);
  add(
    isPersonal ? "Collect from customer" : "Collect from UC",
    calc.total ? inr(calc.total) : "",
  );
  if (!isPersonal && calc.advance) add("Booking advance", inr(calc.advance));
  add(
    "Instalments",
    form.installments
      .filter((i) => i.date && num(i.amount) > 0)
      .map((i) => `${fmtDate(i.date, false)}: ${inr(num(i.amount))}`)
      .join("\n"),
  );
  add("Parking", form.parking);
  add(
    "Extra km / hr",
    `${form.extraKm ? `₹${form.extraKm}/km` : "Nill"} / ${form.extraHr ? `₹${form.extraHr}/hr` : "Nill"}`,
  );
  add(
    `DA after ${form.daAfterTime || "11 PM"}`,
    `₹${form.daAmount || 0}${form.daPerHourAfter1Am ? ` (after 1 AM ₹${form.daPerHourAfter1Am}/hr)` : ""}`,
  );
  add(
    "Instructions",
    activeRules(form, tripType)
      .map((r) => `• ${plain(r.text)}`)
      .join("\n"),
  );
  add("Sent by", `${form.senderName} | ${form.senderPhone} | ${form.senderCity}`);
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
    legs: form.legs.map((l) => ({
      vehicle: l.vehicle,
      date: l.date,
      pickupTime: l.pickupTime,
      pickupLocations: l.pickupLocations
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      destinations: l.destinations,
      dropLocations: l.dropLocations
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      dropDate: l.dropDate || l.date,
      dropTime: l.dropTime,
    })),
    vehicle: {
      model: form.vehicleModel,
      seats: num(form.seats),
      count: num(form.vehicleCount) || 1,
      ac: form.ac,
      specialReq: form.specialReq,
      vehicleNo: form.vehicleNo,
    },
    customer: {
      name: form.customerName,
      phone: form.customerPhone,
      pickupAddress: form.pickupAddress,
      mapLink: form.mapLink,
      pickupTime: form.pickupTime,
    },
    payment: {
      collectFrom: isPersonalType(tripType) ? "customer" : "uc",
      total: calc.total,
      inclusions: form.inclusions,
      billingBasis: form.billingBasis,
      installments: form.installments
        .filter((i) => i.date && num(i.amount) > 0)
        .map((i) => ({ date: i.date, amount: num(i.amount) })),
    },
    terms: {
      parking: form.parking,
      extraKmRate: num(form.extraKm),
      extraHrRate: num(form.extraHr),
      daAfterTime: form.daAfterTime,
      daAmount: num(form.daAmount),
      daPerHourAfter1Am: num(form.daPerHourAfter1Am),
    },
    instructions: activeRules(form, tripType).map((r) => r.key),
    notes: form.notes,
    sentBy: {
      name: form.senderName,
      phone: form.senderPhone,
      city: form.senderCity,
    },
    generatedMessage: message,
  };

  return tripType === "personal"
    ? common
    : {
        ...common,
        corporate: {
          kmLimit: num(form.kmLimit),
          bookingAdvance: calc.advance,
        },
      };
};

const isPersonalType = (t: TripType) => t === "personal";
