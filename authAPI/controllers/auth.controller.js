import User from "../models/user.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });
  try {
    await newUser.save();
    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "User created successfully!",
    });
  } catch (error) {
    next(errorHandler(409, "Duplicate username or email!"));
  }
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser)
      return next(errorHandler(400, "Email not found!! New to this site?"));
    const validPassword = await bcryptjs.compareSync(
      password,
      validUser.password
    );
    if (!validPassword) return next(errorHandler(401, "Invalid Password"));
    // Creating JWT access token for valid user
    const accessToken = jwt.sign(
      { id: validUser._id, username: validUser.username },
      process.env.JWT_SECRET
    );
    // Preparing user details without password.
    const { password: hashedPassword, ...rest } = validUser._doc;

    const expiryDate = new Date(Date.now() + 3600000); // 1 hour
    res
      .cookie("token", accessToken, { httpOnly: true, expires: expiryDate })
      .status(200)
      .json({
        success: true,
        statusCode: 200,
        message: "User logged in successfully!",
        data: rest,
      });
  } catch (error) {
    next(errorHandler(500, "Check DB connection"));
  }
};
