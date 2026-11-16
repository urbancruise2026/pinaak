export const calculateVehicleAgingParts = (reg_date) => {
  if (!reg_date) return { years: 0, months: 0 };

  const registrationDate = new Date(reg_date);

  // galat date aaye to crash ya NaN ki jagah 0 return karo
  if (Number.isNaN(registrationDate.getTime())) {
    return { years: 0, months: 0 };
  }

  const today = new Date();

  let years = today.getFullYear() - registrationDate.getFullYear();
  let months = today.getMonth() - registrationDate.getMonth();

  if (today.getDate() < registrationDate.getDate()) {
    months--;
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  // future reg_date (jaise 2026-09-02 ya 3344-11-11) par negative age nahi aani chahiye
  if (years < 0) {
    return { years: 0, months: 0 };
  }

  return { years, months };
};

// "years.months" string return karta hai, jaise "4.9" (4 saal 9 mahine)
// Pehle Number() tha, jisse 10 mahine ("0.10") 0.1 ban jata tha (1 mahine jaisa dikhta tha).
// String rakhne se 0.10 aur 1.10 sahi dikhte hain.
export const calculateVehicleAging = (reg_date) => {
  const { years, months } = calculateVehicleAgingParts(reg_date);
  return `${years}.${months}`;
};
