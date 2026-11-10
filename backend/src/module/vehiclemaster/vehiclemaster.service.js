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
  audi: "AU", // confirm karo
  maruti: "MR", // confirm karo
};

const MODEL_CODES = {
  // Audi
  q3: "Q3",
  a4: "A4",
  a6: "A6",
  q7: "Q7",
  q5: "Q5",
  q8: "Q8",

  // Mercedes
  "a class": "AC",
  gla: "GLA",
  "c class": "CC",
  "s class": "SC",
  "e class": "EC",
  eqs: "EQS",
  glb: "GLB",
  glc: "GLC",
  "g class": "GC",
  "v class": "VC",

  // Toyota
  crysta: "CRY",
  hycross: "HYC",
  fortuner: "FOR",
  vellfire: "VEL",

  // Maruti
  dzire: "DZI",
  ertiga: "ERT",
  ciaz: "CIA",
  invicto: "INV",

  // Kia
  sonet: "SON",
  seltos: "SEL",
  carens: "CAR",
  carnival: "CRN",

  // Buses
  "lux bus": "LXB",
  "mini bus": "MNB",
  traveller: "TRV",
  urbania: "URB",
};

const getMakeCode = (make) => {
  const key = make.trim().toLowerCase().replace(/\s+/g, " ");
  const code = MAKE_CODES[key];

  if (!code) {
    throw new Error(`Unknown make: ${make}`);
  }

  return code;
};

const getModelCode = (model) => {
  const key = model.trim().toLowerCase().replace(/\s+/g, " ");
  const code = MODEL_CODES[key];

  if (!code) {
    throw new Error(`Unknown model: ${model}`);
  }

  return code;
};

export const generateVehicleCode = (seat, category, config, make, model) => {
  if (!seat || !category || !config || !make || !model) {
    throw new Error("Seat, Category, Config, Make and Model are required.");
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
  const modelCode = getModelCode(model);

  return `${seat}-${categoryCode}-${config}-${makeCode}-${modelCode}`;
};

