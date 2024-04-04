import express from "express";
import { test, updateUserData } from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyToken.js";

const userRouter = express.Router();

userRouter.get("/", test);
userRouter.post("/update/:id", verifyToken, updateUserData);

export default userRouter;
