import Router from "express";
import { query } from "express-validator";
import verifyLogin from "../middlewares/auth.middleware.js";
import {
  getCoordinates,
  getDistanceTime,
  getAutoCompleteSuggestions,
} from "../controllers/maps.controller.js";

const router = Router();

router.use(verifyLogin);

router.get(
  "/coordinates",
  query("address").notEmpty().isString().isLength({ min: 3 }),
  getCoordinates
);

router.get(
  "/distance-time",
  query("origin").notEmpty().isString().isLength({ min: 3 }),
  query("destination").notEmpty().isString().isLength({ min: 3 }),
  getDistanceTime
);

router.get("/suggestions", getAutoCompleteSuggestions);

export default router;
