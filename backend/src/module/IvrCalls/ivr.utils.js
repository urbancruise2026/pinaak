// Pure helpers (no DB, no network) so they are easy to test.

const IST_OFFSET_MIN = 330;
const pad = (n) => String(n).padStart(2, "0");

// Date -> "YYYY-MM-DD HH:mm:ss" in IST.
export const formatIST = (date) => {
  const d = new Date(date.getTime() + IST_OFFSET_MIN * 60000);
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
  );
};

export const nowIST = () => formatIST(new Date());
export const todayIST = () => nowIST().slice(0, 10);

// "YYYY-MM-DD HH:mm:ss" (IST) -> unix seconds.
export const istStringToUnix = (str) =>
  Math.floor(Date.parse(`${str.replace(" ", "T")}+05:30`) / 1000);

export const isValidDate = (s) =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));

// Accepts what MyOperator may send for a timestamp and returns IST string.
//   - unix seconds / milliseconds (number or numeric string)
//   - "DD-MM-YYYY HH:mm:ss"   (the panel export format, already IST)
//   - "YYYY-MM-DD HH:mm:ss"   (assumed IST)
export const parseCallTime = (value) => {
  if (value === null || value === undefined || value === "") return null;

  if (typeof value === "number" || /^\d{9,13}$/.test(String(value))) {
    let n = Number(value);
    if (n > 1e11) n = Math.floor(n / 1000); // milliseconds
    return formatIST(new Date(n * 1000));
  }

  const s = String(value).trim();
  let m = s.match(/^(\d{2})-(\d{2})-(\d{4})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]} ${m[4]}:${m[5]}:${m[6] ?? "00"}`;

  m = s.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
  if (m) return `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:${m[6] ?? "00"}`;

  return null;
};

// "+916395487329" -> "6395487329" style comparison key (last 10 digits).
export const normalizePhone = (value) => {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length > 10 ? digits.slice(-10) : digits;
};

// " Muskan,Mehak" -> ["Muskan", "Mehak"]
export const splitAgents = (value) =>
  String(value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const toInt = (value, fallback = 0) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
};
