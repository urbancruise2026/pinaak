import { Router } from "express";
import {
  addCountryCode,
  AllCountryCodes,
  getCountryCode,
} from "./country.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(addCountryCode).get(getCountryCode);
router.route("/codes").get(AllCountryCodes);

export default router;
