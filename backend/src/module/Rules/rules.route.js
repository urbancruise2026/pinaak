import { Router } from "express";
import {
  createEntry,
  deleteEntry,
  getAdviserbyzones,
  getEntries,
  updateEntry,
} from "./rules.controller.js";
import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();
router.route("/").post(verifyJWT, createEntry);
router.route("/getrule").get(verifyJWT, getEntries);
router.route("/:id").put(verifyJWT, updateEntry);
router.route("/delete/:id").delete(verifyJWT, deleteEntry);
router.route("/advisors-by-zone").get(verifyJWT, getAdviserbyzones);
export default router;
