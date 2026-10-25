import express from "express";
import {
  createDriverController,
  getAllDriversController,
  getDriverByIdController,
  updateDriverController,
  deleteDriverController,
} from "./driver.controller.js";
// import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// router.use(verifyJWT);

router.post("/", createDriverController);

router.get("/", getAllDriversController);

router.get("/:id", getDriverByIdController);

router.put("/:id", updateDriverController);

router.delete("/:id", deleteDriverController);

export default router;
