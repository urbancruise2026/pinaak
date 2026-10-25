export const generateVehicleCode = (seat, category, config) => {
  if (!seat || !category || !config) {
    throw new Error("Seat, Category and Config are required.");
  }

  const words = category.trim().split(/\s+/);

  let categoryCode = "";

  if (words.length > 1) {
    categoryCode = words.map((word) => word.charAt(0).toUpperCase()).join("");
  } else {
    const word = words[0].toUpperCase();
    categoryCode = word.charAt(0) + (word.charAt(2) || "");
  }

  return `${seat}-${categoryCode}-${config}`;
};
