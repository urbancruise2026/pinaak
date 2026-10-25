import { Router } from "express";
import {
  createVendorController,
  getAllVendorsController,
  getVendorByIdController,
  updateVendorController,
} from "./vendor.controller.js";
// import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();
// router.use(verifyJWT);
router.route("/").post(createVendorController);
router.route("/").get(getAllVendorsController);
router.route("/:id").get(getVendorByIdController);
router.route("/:id").put(updateVendorController);

export default router;
