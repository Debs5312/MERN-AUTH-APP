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
  try {
    const loginHistoryId = uuid();
    const loginDetails = new LoginAccount({
      loginHistoryId: loginHistoryId,
      userid: validUser._id.toString(),
      loginTime: dateHandler(new Date()),
    });
    await loginDetails.save();
    return loginHistoryId;
  } catch (error) {
    throw new Error(
      "Something wrong with Login Account DB connection!! " + error.message
    );
  }
};

const tokenHandler = (loginHistoryId, validUser) => {
  return jwt.sign(
    { id: validUser._id, loginHistoryId: loginHistoryId },
    process.env.JWT_SECRET
  );
};

const updateUserActiveStatus = async (userid, status) => {
  try {
    // filter to find the item
    const filter = { _id: userid };
    // Set the field to be updated
    const updateDocument = {
      $set: {
        active: status,
      },
    };
    // Initiate update operation
    await User.updateOne(filter, updateDocument);
    return;
  } catch (error) {
    throw new Error(
      "Unable to update active status of user !! " + error.message
    );
  }
};

const updateLogoutforLastLoginSession = async (validUser) => {
  try {
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
    return;
  } catch (error) {
    throw new Error(
      "Something wrong with logout session update!!" + error.message
    );
  }
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
    next(errorHandler(409, new Error("Duplicate username or email!")));
  }
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // Check validity of user
    const validUser = await User.findOne({ email });
    if (!validUser)
      return next(
        errorHandler(400, new Error("Email not found!! New to this site?"))
      );
    // Check validity of password
    const validPassword = await bcryptjs.compareSync(
      password,
      validUser.password
    );
    if (!validPassword)
      return next(errorHandler(401, new Error("Invalid Password")));

    // if user is logged in previously  -->  end previous session before starting a new one
    if (validUser.active) {
      await updateLogoutforLastLoginSession(validUser);

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
      const accessToken = tokenHandler(loginHistoryId, validUser);
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

      // Update active status : true on MongoDB

      await updateUserActiveStatus(validUser._id, true);

      // Preparing user details without password.
      const {
        password: hashedPassword,
        createdAt,
        updatedAt,
        ...rest
      } = newUser;
      // Creating JWT access token for valid user
      const accessToken = tokenHandler(loginHistoryId, validUser);
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
    const validUser = await User.findOne({ email: req.body.email });
    if (validUser) {
      // if user is logged in previously  -->  end previous session before starting a new one
      if (validUser.active) {
        await updateLogoutforLastLoginSession(validUser);

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
        const accessToken = tokenHandler(loginHistoryId, validUser);
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

        // Update active status on MongoDB

        await updateUserActiveStatus(validUser._id, true);

        // Preparing user details without password.
        const {
          password: hashedPassword,
          createdAt,
          updatedAt,
          ...rest
        } = newUser;
        // Creating JWT access token for valid user
        const accessToken = tokenHandler(loginHistoryId, validUser);
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
    } else {
      next(errorHandler(400, new Error("User not found")));
    }
  } catch (error) {
    next(errorHandler(500, error));
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
      next(
        errorHandler(409, new Error("Account already exists!! Try logging in"))
      );
    }
  } catch (error) {
    next(errorHandler(500, new Error("Check DB connection")));
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
      // Update logout timing for last login session on MongoDB

      // filter to find the item
      const filter = { _id: userLoginAccount._id };
      // Set the field to be updated
      const updateDocument = {
        $set: {
          logoutTime: dateHandler(new Date()),
        },
      };
      // Initiate update operation
      await LoginAccount.updateOne(filter, updateDocument);

      await updateUserActiveStatus(userid, false);

      res.clearCookie("token").status(200).json({
        success: true,
        statusCode: 200,
        message: "User logged out successfully!",
      });
    } else {
      next(errorHandler(400, new Error("User not logged in")));
    }
  } catch (error) {
    next(errorHandler(500, error));
  }
};
