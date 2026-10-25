export const calculateVehicleAging = (reg_date) => {
  if (!reg_date) return 0;

  const registrationDate = new Date(reg_date);
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

  return Number(`${Math.max(years, 0)}.${months}`);
};
