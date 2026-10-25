import { Router } from "express";

import {
  getCitiesByZoneController,
  getAllRegionsController,
  getZonesByRegionController,
} from "./zone.controllers.js";

const router = Router();

// Get all regions
router.route("/regions").get(getAllRegionsController);

// Get zones by region
router.route("/regions/:regionId/zones").get(getZonesByRegionController);

// Get cities by zone
router.route("/zones/:zoneId/cities").get(getCitiesByZoneController);

export default router;
