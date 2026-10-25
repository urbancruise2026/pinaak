import { Router } from "express";
import {
  createCustomer,
  getAllCustomersController,
  getCustomerByIdController,
  searchCustomerController,
  updateCustomer,
} from "./newCustomer.Controller.js";
// import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();
// router.use(verifyJWT);
router.route("/").post(createCustomer);
router.route("/").get(getAllCustomersController);
router.route("/search").get(searchCustomerController);
router.route("/:id").get(getCustomerByIdController);
router.route("/:id").put(updateCustomer);

export default router;
