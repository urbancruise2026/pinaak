import { Router } from "express";
import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { createDsr, getAllDsr } from "./dsr.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/create").post(createDsr);
router.route("/getAll").get(getAllDsr);

export default router;
