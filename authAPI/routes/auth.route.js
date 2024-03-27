import express from "express";
import { signIn, signup } from "../controllers/auth.controller.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/signin", signIn);

export default authRouter;
