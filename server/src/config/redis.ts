import Redis from "ioredis";
import { config } from "./app.config";

const redis = new Redis(config.REDIS_URL, {
  tls: {},
  maxRetriesPerRequest: 5,
  connectTimeout: 10000,
});

redis.on("error", (err) => {
  console.error("[Redis error]", err);
});

export default redis;
