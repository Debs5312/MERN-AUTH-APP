import express from "express";
import {
  signIn,
  signup,
  googleSignIn,
  googleSignUp,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signIn);
authRouter.post("/googlesignin", googleSignIn);
authRouter.post("/googlesignup", googleSignUp);

export default authRouter;
