import express from "express";
import {
  signIn,
  signup,
  googleSignIn,
  googleSignUp,
  logout,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signIn);
authRouter.post("/googlesignin", googleSignIn);
authRouter.post("/googlesignup", googleSignUp);
authRouter.post("/logout", logout);

export default authRouter;
