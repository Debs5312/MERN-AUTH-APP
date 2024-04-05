import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token)
    return next(errorHandler(401, new Error("Unauthorized!! Please login")));

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedData) => {
    if (err) return next(errorHandler(403, new Error("Invalid token!")));
    req.decodedData = decodedData;
    next();
  });
};
