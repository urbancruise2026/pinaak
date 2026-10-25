import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  getCurrentUSer,
  loginUser,
  registerUser,
  getSalesUsersController,
  updateUserController,
  userLogout,
} from "./user.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later." },
});

router.route("/").post(registerUser);
router.route("/login").post(loginLimiter, loginUser);
router.use(verifyJWT);
router.route("/current-user").get(getCurrentUSer);
router.route("/sales").get(getSalesUsersController);
router.route("/update/:id").put(updateUserController);
router.route("/logout").post(userLogout);
export default router;
