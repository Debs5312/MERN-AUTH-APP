import User from "../models/user.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    await newUser.save();
    res
      .status(201)
      .json({
        success: true,
        statusCode: 201,
        message: "User created successfully!",
      });
  } catch (error) {
    next(errorHandler(409, "Duplicate username or email!"));
  }
};
