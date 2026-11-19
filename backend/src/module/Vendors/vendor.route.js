import {
  createVendorController,
  getAllVendorsController,
  getVendorByIdController,
  updateVendorController,
  updateVendorStatusController,
  deleteVendorController,
  updateVendorVerificationController,
  getRegionByStateIdController,
} from "./vendor.controller.js";
import { getAllAccessCitiesController } from "./vendor.controller.js";
import { Router } from "express";

const router = Router();

// Static routes pehle (taki /:id se clash na ho)
router.route("/access-cities").get(getAllAccessCitiesController);
router.get("/states/:stateId/region", getRegionByStateIdController);
router.route("/").post(createVendorController).get(getAllVendorsController);

router
  .route("/:id")
  .get(getVendorByIdController)
  .put(updateVendorController)
  .delete(deleteVendorController);

router.route("/:id/status").patch(updateVendorStatusController);
router.route("/:id/verification").patch(updateVendorVerificationController);

export default router;
