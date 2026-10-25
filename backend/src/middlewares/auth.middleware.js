import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { findUserById } from "../module/user/user.model.js";
import { findVendorById } from "../module/Vendors/vendor.model.js";
// import { findVendorById } from "../module/vendor/vendor.model.js";
// import { findDriverById } from "../module/driver/driver.model.js";
// import { findCustomerById } from "../module/customer/customer.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return res.status(401).json({
      message: "Authorization token missing",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    let user = null;

    switch (decoded.loginType) {
      case "employee":
        user = await findUserById(decoded.id);
        break;

      case "vendor":
        user = await findVendorById(decoded.id);
        break;

      case "driver":
        user = await findDriverById(decoded.id);
        break;

      case "customer":
        user = await findCustomerById(decoded.id);
        break;

      default:
        return res.status(401).json({
          message: "Invalid login type",
        });
    }

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    delete user.password;

    req.user = {
      ...user,
      loginType: decoded.loginType,
    };

    next();
  } catch (error) {
    console.error("JWT ERROR:", error.message);

    return res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
});
