import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  findHrmsUserByUserName,
  findVendorByUserName,
  saveHrmsRefreshToken,
  saveVendorRefreshToken,
  recordHrmsLoginEvent,
  findUserById,
} from "./user.model.js";
import { ApiError } from "../../utils/ApiError.js";

const isPasswordCorrect = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

const generateTokens = ({ id, role, loginType }) => {
  const payload = {
    id,
    role,
    loginType,
  };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1d",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const loginService = async ({
  username,
  password,
  loginType,
  ipAddress = null,
  userAgent = null,
}) => {
  if (!username || !password) {
    throw new ApiError(400, "Username and password are required");
  }

  let user;

  switch (loginType) {
    case "employee":
      user = await findHrmsUserByUserName(username);
      break;

    case "vendor":
      user = await findVendorByUserName(username);
      break;

    case "driver":
      user = await findDriverByUserName(username);
      break;

    case "customer":
      user = await findCustomerByUserName(username);
      break;

    default:
      throw new ApiError(400, "Invalid login type");
  }

  const isEmployee = loginType === "employee";

  if (!user) {
    if (isEmployee) {
      await recordHrmsLoginEvent({
        usernameAttempted: username,
        eventType: "login_failed",
        failureReason: "user_not_found",
        ipAddress,
        userAgent,
      });
    }
    throw new ApiError(404, "User not found");
  }

  if (Number(user.is_active) !== 1) {
    if (isEmployee) {
      await recordHrmsLoginEvent({
        staffId: user.id,
        usernameAttempted: username,
        eventType: "login_failed",
        failureReason: "account_inactive",
        ipAddress,
        userAgent,
      });
    }
    throw new ApiError(403, "Your account is inactive. Please contact admin.");
  }
  const validPassword = await isPasswordCorrect(password, user.password);

  if (!validPassword) {
    if (isEmployee) {
      await recordHrmsLoginEvent({
        staffId: user.id,
        usernameAttempted: username,
        eventType: "login_failed",
        failureReason: "invalid_password",
        ipAddress,
        userAgent,
      });
    }
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = generateTokens({
    id: user.id,
    role: user.role,
    loginType,
  });

  switch (loginType) {
    case "employee": {
      const { sessionId } = await saveHrmsRefreshToken(user.id, refreshToken, {
        ipAddress,
        userAgent,
      });
      await recordHrmsLoginEvent({
        staffId: user.id,
        sessionId,
        usernameAttempted: username,
        eventType: "login_success",
        ipAddress,
        userAgent,
      });
      break;
    }

    case "vendor":
      await saveVendorRefreshToken(user.id, refreshToken);
      break;

    case "driver":
      await saveDriverRefreshToken(user.id, refreshToken);
      break;

    case "customer":
      await saveCustomerRefreshToken(user.id, refreshToken);
      break;
  }

  delete user.password;

  // Employees: return the full staff profile (uc_staff + role / department /
  // access control) like the old `users` row, not just the credential row.
  const loginUser = isEmployee ? await findUserById(user.id) : user;

  return {
    loginUser,
    accessToken,
    refreshToken,
  };
};

export { generateTokens, isPasswordCorrect, loginService };
