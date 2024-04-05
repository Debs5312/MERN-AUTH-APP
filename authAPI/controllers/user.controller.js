import bcryptjs from "bcryptjs";
import User from "../models/user.js";
import { errorHandler } from "../utils/error.js";
import LoginAccount from "../models/login.js";

export const test = (req, res) => {
  res.json({
    message: "Hello World",
  });
};

// Update user data

export const updateUserData = async (req, res, next) => {
  // Check validity of user
  const validUser = await User.findOne({ _id: req.params.id });
  if (!validUser) {
    return next(errorHandler(404, new Error("User not found in DB.")));
  }
  if (!validUser.active) {
    res.clearCookie("token").status(401).json({
      success: false,
      statusCode: 401,
      message: "User logged out in previous active session!!",
    });
  }
  // finding last login history for user
  const activeLoginHistory = await LoginAccount.findOne({
    userid: req.params.id.toString(),
    logoutTime: "",
  });

  if (activeLoginHistory.loginHistoryId !== req.decodedData.loginHistoryId) {
    res.clearCookie("token").status(401).json({
      success: false,
      statusCode: 401,
      message: "Wrong session cookie!",
    });
  }

  if (req.decodedData.id !== req.params.id) {
    res.clearCookie("token").status(401).json({
      success: false,
      statusCode: 401,
      message: "Cookie details and Params id is not matched!!",
    });
  }
  try {
    if (req.body.password) {
      const hashedUpdatedPasswd = await bcryptjs.hashSync(
        req.body.password,
        10
      );
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            password: hashedUpdatedPasswd,
            profilePicture: req.body.profilePicture,
          },
        },
        { new: true }
      );
      const { password, ...rest } = updatedUser._doc;
      const finalResponseData = {
        ...rest,
        loginHistoryId: req.decodedData.loginHistoryId,
      };
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "Updated Changes!!",
        data: finalResponseData,
      });
    }
  } catch (error) {
    next(
      errorHandler(500, new Error(`Check DB connection -- ${error.message}`))
    );
  }
};
