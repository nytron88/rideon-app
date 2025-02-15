import client from "../services/redis.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";

const MAX_REQUESTS = 20;
const TIME_WINDOW = 10 * 1000;

const rateLimiter = asyncHandler(async (req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress;

  const key = `rate_limit:${ip}`;
  const now = Date.now();

  const pipeline = client.multi();
  pipeline.zremrangebyscore(key, 0, now - TIME_WINDOW);
  pipeline.zcount(key, now - TIME_WINDOW, now);
  pipeline.zrange(key, 0, 0);
  const results = await pipeline.exec();

  const requestCount = results[1][1];
  const firstRequestTimestamp = results[2][1]?.[0] || null;
  const retryAfter = firstRequestTimestamp
    ? Math.max(firstRequestTimestamp - now + TIME_WINDOW, 0)
    : 0;

  if (requestCount < MAX_REQUESTS) {
    await client.zadd(key, now, now);
    return next();
  } else {
    res.set("Retry-After", Math.ceil(retryAfter / 1000));
    throw new ApiError(429, "Too many requests");
  }
});

export default rateLimiter;
