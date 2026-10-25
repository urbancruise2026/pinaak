import { Router } from "express";
import {
  fetchAllCities,
  fetchStates,
  fetchStatesByCity, // ← add karo
} from "./state.controller.js";

const router = Router();

router.route("/").get(fetchStates);
router.route("/allcity").get(fetchAllCities);
router.route("/states-by-city/:cityName").get(fetchStatesByCity); // ← NEW

export default router;
