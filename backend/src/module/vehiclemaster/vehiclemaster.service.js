const MAKE_CODES = {
  "ashok leyland": "AL",
  "bharat benz": "BB",
  eicher: "EI",
  "force motors": "FM",
  "mercedes benz": "MB",
  "sml mahindra": "SML",
  suzuki: "SZ", // confirm karo
  tata: "TA",
  toyota: "TY", // confirm karo
  kia: "KI", // confirm karo
  volvo: "VO",
  mahindra: "MH", // confirm karo
};

const getMakeCode = (make) => {
  const key = make.trim().toLowerCase().replace(/\s+/g, " ");
  const code = MAKE_CODES[key];

  if (!code) {
    throw new Error(`Unknown make: ${make}`);
  }

  return code;
};

export const generateVehicleCode = (seat, category, config, make) => {
  if (!seat || !category || !config || !make) {
    throw new Error("Seat, Category, Config and Make are required.");
  }

  const words = category.trim().split(/\s+/);

  let categoryCode = "";

  if (words.length > 1) {
    categoryCode = words.map((word) => word.charAt(0).toUpperCase()).join("");
  } else {
    const word = words[0].toUpperCase();
    categoryCode = word.charAt(0) + (word.charAt(2) || "");
  }

  const makeCode = getMakeCode(make);

  return `${seat}-${categoryCode}-${config}-${makeCode}`;
};