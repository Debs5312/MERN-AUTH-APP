import User from "../models/user.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";
import LoginAccount from "../models/login.js";
import { v4 as uuid } from "uuid";

const dateHandler = (date) => {
  return (
    ("00" + (date.getMonth() + 1)).slice(-2) +
    "/" +
    ("00" + date.getDate()).slice(-2) +
    "/" +
    date.getFullYear() +
    " " +
    ("00" + date.getHours()).slice(-2) +
    ":" +
    ("00" + date.getMinutes()).slice(-2) +
    ":" +
    ("00" + date.getSeconds()).slice(-2) +
    " IST"
  );
};

const prepareLoginHistoryAccount = async (validUser) => {
  const loginHistoryId = uuid();
  const loginDetails = new LoginAccount({
    loginHistoryId: loginHistoryId,
    userid: validUser._id.toString(),
    loginTime: dateHandler(new Date()),
  });
  await loginDetails.save();
  return loginHistoryId;
};

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
    // Check validity of user
    const validUser = await User.findOne({ email });
    if (!validUser)
      return next(errorHandler(400, "Email not found!! New to this site?"));
    // Check validity of password
    const validPassword = await bcryptjs.compareSync(
      password,
      validUser.password
    );
    if (!validPassword) return next(errorHandler(401, "Invalid Password"));

    // if user is logged in previously  -->  end previous session before starting a new one
    if (validUser.active) {
      // finding last login history for user
      const activeLoginHistory = await LoginAccount.findOne({
        userid: validUser._id.toString(),
        logoutTime: "",
      });
      // Update logout timing for last login session on MongoDB

      // filter to find the item
      const filter = { _id: activeLoginHistory._id };
      // Set the field to be updated
      const updateDocument = {
        $set: {
          logoutTime: dateHandler(new Date()),
        },
      };
      // Initiate update operation
      await LoginAccount.updateOne(filter, updateDocument);

      // Preparing user details without password.
      const {
        password: hashedPassword,
        createdAt,
        updatedAt,
        ...rest
      } = validUser._doc;

      // Initialte a new login session
      const loginHistoryId = await prepareLoginHistoryAccount(validUser);
      // Creating JWT access token for valid user
      const accessToken = jwt.sign(
        { id: validUser._id, loginHistoryId: loginHistoryId },
        process.env.JWT_SECRET
      );
      // final response data with Login history ID
      const finalResponseData = { ...rest, loginHistoryId };
      // Set 1 hour expiry time for token
      const expiryDate = new Date(Date.now() + 3600000); // 1 hour
      res
        .cookie("token", accessToken, { httpOnly: true, expires: expiryDate })
        .status(200)
        .json({
          success: true,
          statusCode: 200,
          message: "User logged in successfully!",
          data: finalResponseData,
        });
    } else {
      // Preparing new login history of user
      const loginHistoryId = await prepareLoginHistoryAccount(validUser);

      // active flag = true upon successful sign-in
      const newUser = { ...validUser._doc, active: true };

      // Update operation on MongoDB

      // filter to find the item
      const filter = { _id: validUser._id };
      // Set the field to be updated
      const updateDocument = {
        $set: {
          active: true,
        },
      };
      // Initiate update operation
      await User.updateOne(filter, updateDocument);

      // Preparing user details without password.
      const {
        password: hashedPassword,
        createdAt,
        updatedAt,
        ...rest
      } = newUser;
      // Creating JWT access token for valid user
      const accessToken = jwt.sign(
        { id: validUser._id, loginHistoryId: loginHistoryId },
        process.env.JWT_SECRET
      );
      // final response data with Login history ID
      const finalResponseData = { ...rest, loginHistoryId };
      // Set 1 hour expiry time for token
      const expiryDate = new Date(Date.now() + 3600000); // 1 hour
      res
        .cookie("token", accessToken, { httpOnly: true, expires: expiryDate })
        .status(200)
        .json({
          success: true,
          statusCode: 200,
          message: "User logged in successfully!",
          data: finalResponseData,
        });
    }
  } catch (error) {
    next(errorHandler(500, error));
  }
};

export const googleSignIn = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      // Preparing login history of user
      const loginHistoryId = await uuid();
      const loginDetails = new LoginAccount({
        loginHistoryId: loginHistoryId,
        userid: user._id.toString(),
        loginTime: dateHandler(new Date()),
      });
      await loginDetails.save();

      // active flag = true upon successful sign-in
      const newUser = { ...user._doc, active: true };

      // Update operation on MongoDB

      // filter to find the item
      const filter = { _id: user._id };
      // Set the field to be updated
      const updateDocument = {
        $set: {
          active: true,
        },
      };
      // Initiate update operation
      await User.updateOne(filter, updateDocument);

      // Preparing user details without password.
      const {
        password: hashedPassword,
        createdAt,
        updatedAt,
        ...rest
      } = newUser;
      // Creating JWT access token for valid user
      const accessToken = jwt.sign(
        { id: user._id, loginHistoryId: loginHistoryId },
        process.env.JWT_SECRET
      );
      // final response data with Login history ID
      const finalResponseData = { ...rest, loginHistoryId };
      // Set 1 hour expiry time for token
      const expiryDate = new Date(Date.now() + 3600000); // 1 hour
      res
        .cookie("token", accessToken, { httpOnly: true, expires: expiryDate })
        .status(200)
        .json({
          success: true,
          statusCode: 200,
          message: "User logged in successfully!",
          data: finalResponseData,
        });
    } else {
      next(errorHandler(400, "User not found"));
    }
  } catch (error) {
    next(errorHandler(500, "Not able to connect with firebase Google"));
  }
};

export const googleSignUp = async (req, res, next) => {
  try {
    const { name, email, photo } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      const generatedPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcryptjs.hashSync(generatedPassword, 10);
      const randNUmber = Math.floor(Math.random() * 1000);
      const newUser = new User({
        username:
          name.split(" ").join("").toLowerCase() + randNUmber.toString(),
        password: hashedPassword,
        email: email,
        profilePicture: photo,
      });
      await newUser.save();
      res.status(201).json({
        success: true,
        statusCode: 201,
        message: "User created successfully!",
      });
    } else {
      next(errorHandler(409, "Account already exists!! Try logging in"));
    }
  } catch (error) {
    next(errorHandler(500, "Check DB connection"));
  }
};

export const logout = async (req, res, next) => {
  const { userid, loginHistoryId } = req.body;
  try {
    const userLoginAccount = await LoginAccount.findOne({
      userid,
      loginHistoryId,
    });
    if (userLoginAccount) {
      userLoginAccount.logoutTime = dateHandler(new Date());
      await userLoginAccount.save();
      res.clearCookie("token").status(200).json({
        success: true,
        statusCode: 200,
        message: "User logged out successfully!",
      });
    } else {
      next(errorHandler(400, "User not logged in"));
    }
  } catch (error) {
    next(errorHandler(500, error.message));
  }
};
