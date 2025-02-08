import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

import rateLimiter from "./middlewares/rateLimiter.middleware.js";

app.use(rateLimiter);

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);

import errorHandler from "./middlewares/errorHandler.middleware.js";

app.use(errorHandler);

export default app;
