import { Router } from "express";
import {
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAllVehicles,
  getSeatOptions,
  getVehicleCodeList,
  getVehiclesById,
  getVehicleVariantByCodeController,
} from "./vehiclemaster.controller.js";

const router = Router();

router.get("/", getVehicleCodeList);
router.post("/", createVehicle);

// fixed paths first
router.get("/seat-options", getSeatOptions);
router.get("/getall", getAllVehicles);
router.get("/variant/:code", getVehicleVariantByCodeController);

// dynamic :id LAST
router
  .route("/:id")
  .get(getVehiclesById)
  .put(updateVehicle)
  .delete(deleteVehicle);

export default router;