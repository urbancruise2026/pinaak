// controllers/captcha.controller.js

import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { generateCaptcha } from "../../utils/mathCaptcha.js";

export const getCaptchaController = asyncHandler(async (req, res) => {
  const captcha = generateCaptcha();

  return res
    .status(200)
    .json(new ApiResponse(200, captcha, "Captcha generated successfully"));
});
