import bcryptjs from "bcryptjs";
import User from "../models/user.js";
import { errorHandler } from "../utils/error.js";

export const test = (req, res) => {
  res.json({
    message: "Hello World",
  });
};

// Update user data

export const updateUserData = async (req, res, next) => {
  if (req.decodedData.id !== req.params.id) {
    return next(errorHandler(401, new Error("Wrong User id or cookie!!")));
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
