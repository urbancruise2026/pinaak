import { Router } from "express";
import {
  createVehicleManager,
  getAllVehicleManagers,
  getVehicleManagerByIdController,
  getVehicleManagerVendors,
  getVehicleMasterCodes,
  getVehicleMasterAmenities,
  getAllCitiesController,
  updateVehicleManagerStatus,
} from "./vehicleManager.controller.js";

const router = Router();
router.route("/citys").get(getAllCitiesController);

// ⚠️ Static/named routes ALWAYS "/:id" se pehle honi chahiye
router.get("/options/codes", getVehicleMasterCodes);
router.get("/options/vendors", getVehicleManagerVendors);
router.get("/options/amenities", getVehicleMasterAmenities);

router.route("/").post(createVehicleManager).get(getAllVehicleManagers);
router.route("/updatestatus/:id").patch(updateVehicleManagerStatus);
router.route("/:id").get(getVehicleManagerByIdController);

export default router;
