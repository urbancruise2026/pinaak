import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  findHrmsUserByUserName,
  findVendorByUserName,
  saveHrmsRefreshToken,
  saveVendorRefreshToken,
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

const loginService = async ({ username, password, loginType }) => {
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

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (Number(user.is_active) !== 1) {
    throw new ApiError(403, "Your account is inactive. Please contact admin.");
  }
  const validPassword = await isPasswordCorrect(password, user.password);

  if (!validPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = generateTokens({
    id: user.id,
    role: user.role,
    loginType,
  });

  switch (loginType) {
    case "employee":
      await saveHrmsRefreshToken(user.id, refreshToken);
      break;

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

  return {
    loginUser: user,
    accessToken,
    refreshToken,
  };
};

export { generateTokens, isPasswordCorrect, loginService };
