import mongoose from "mongoose";

const loginSchema = mongoose.Schema(
  {
    loginHistoryId: {
      type: String,
      required: true,
    },
    userid: {
      type: String,
      required: true,
    },
    loginTime: {
      type: String,
      required: true,
    },
    logoutTime: {
      type: String,
    },
  },
  { timestamps: true }
);

const LoginAccount = mongoose.model("LoginAccount", loginSchema);

export default LoginAccount;
