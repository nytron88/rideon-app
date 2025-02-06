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

import userRouter from "./routes/user.routes.js";
import captainRouter from "./routes/captain.routes.js";
import healthcheckRouter from "./routes/healthcheck.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/captains", captainRouter);
app.use("/api/v1/healthcheck", healthcheckRouter);

import errorHandler from "./middlewares/errorHandler.middleware.js";

app.use(errorHandler);

export default app;
