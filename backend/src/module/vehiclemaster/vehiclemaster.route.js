import { Router } from "express";
import {
  createVehicle,
  getAllVehicles,
  getSeatOptions,
  getVehicleCodeList,
  getVehiclesById,
  getVehicleVariantByCodeController,
} from "./vehiclemaster.controller.js";

const router = Router();

router.get("/", getVehicleCodeList);
router.route("/").post(createVehicle);
router.get("/seat-options", getSeatOptions);

router.route("/getall").get(getAllVehicles);
router.route("/:id").get(getVehiclesById);
router.route("/variant/:code").get(getVehicleVariantByCodeController);
export default router;
