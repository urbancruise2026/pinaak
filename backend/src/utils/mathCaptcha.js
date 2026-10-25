// utils/mathCaptcha.js

const captchaStore = new Map();
const CAPTCHA_EXPIRY_MS = 5 * 60 * 1000; // 5 minute

export const generateCaptcha = () => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const answer = num1 + num2;

  const captcha_id = `cap_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  captchaStore.set(captcha_id, {
    answer,
    expiresAt: Date.now() + CAPTCHA_EXPIRY_MS,
  });

  for (const [key, value] of captchaStore.entries()) {
    if (value.expiresAt < Date.now()) captchaStore.delete(key);
  }

  return { captcha_id, num1, num2 };
};

export const verifyMathCaptcha = (captcha_id, userAnswer) => {
  if (
    !captcha_id ||
    userAnswer === undefined ||
    userAnswer === null ||
    userAnswer === ""
  ) {
    return false;
  }

  const record = captchaStore.get(captcha_id);
  if (!record) return false;

  captchaStore.delete(captcha_id); // one-time use

  if (Date.now() > record.expiresAt) return false;

  return Number(userAnswer) === record.answer;
};
