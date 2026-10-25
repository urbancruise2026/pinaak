import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  findUserById,
  findUserByEmail,
  findHrmsUserById,
  insertUser,
  saveRefreshToken,
  saveHrmsRefreshToken,
  getSalesUsers,
  updateUserById,
  updateUserRefreshToken,
  findHrmsUserByUserName,
} from "./user.model.js";
import {
  generateTokens,
  isPasswordCorrect,
  loginService,
} from "./user.service.js";

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, city, role, subDepartment_name } = req.body;
  if (!name || !email || !password || !city || !role || !subDepartment_name) {
    throw new ApiError(400, "All fields are required");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const newUser = await insertUser({
    name,
    email,
    password,
    city,
    role,
    subDepartment_name,
  });

  if (!newUser) {
    throw new ApiError(500, "User creation failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newUser, "User created successfully"));
});

// const loginUser = asyncHandler(async (req, res) => {
//   const { username, password } = req.body;
//   if (!username || !password) {
//     throw new ApiError(400, "Username and password are required");
//   }

//   const user = await findHrmsUserByUserName(username);
//   if (!user) {
//     throw new ApiError(404, "User does not exist");
//   }

//   const validPassword = await isPasswordCorrect(password, user.password);
//   if (!validPassword) {
//     throw new ApiError(401, "Invalid credentials");
//   }

//   const { accessToken, refreshToken } = generateTokens(user.id);

//   await saveHrmsRefreshToken(user.id, refreshToken);

//   const cookieOptions = {
//     httpOnly: true,
//     secure: true,
//     sameSite: "None",
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//   };

//   const loginUser = await findHrmsUserById(user.id);

//   res
//     .status(200)
//     .cookie("accessToken", accessToken, cookieOptions)
//     .cookie("refreshToken", refreshToken, cookieOptions)
//     .json(
//       new ApiResponse(
//         200,
//         {
//           loginUser,
//           accessToken,
//           refreshToken,
//         },
//         "User logged in successfully",
//       ),
//     );
// });

const loginUser = asyncHandler(async (req, res) => {
  const { username, password, loginType } = req.body;

  const result = await loginService({
    username,
    password,
    loginType,
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  res
    .status(200)
    .cookie("accessToken", result.accessToken, cookieOptions)
    .cookie("refreshToken", result.refreshToken, cookieOptions)
    .json(new ApiResponse(200, result, "Login successful"));
});

const getCurrentUSer = asyncHandler(async (req, res) => {
  const currentUser = req.user;

  if (!currentUser) {
    throw new ApiError(404, "Current user not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, currentUser, " current user get successfully"));
});

export { registerUser, loginUser, getCurrentUSer };

export const getSalesUsersController = async (req, res) => {
  try {
    const salesUsers = await getSalesUsers();
    res.status(200).json({
      success: true,
      data: salesUsers,
    });
  } catch (error) {
    console.error("Error fetching sales users:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateUserController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, password, city, role, subDepartment_name } = req.body;

  if (!id) {
    throw new ApiError(400, "User id is required");
  }

  const existingUser = await findUserById(id);

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  // email duplicate check
  if (email && email !== existingUser.email) {
    const emailExists = await findUserByEmail(email);

    if (emailExists) {
      throw new ApiError(409, "Email already exists");
    }
  }

  const updatedUser = await updateUserById(id, {
    name,
    email,
    password,
    city,
    subDepartment_name,
    role,
  });

  if (!updatedUser) {
    throw new ApiError(500, "User update failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User updated successfully"));
});

export const userLogout = asyncHandler(async (req, res) => {
  await updateUserRefreshToken(req.user.id, null);
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, [], "User Logged Out Successfully"));
});
