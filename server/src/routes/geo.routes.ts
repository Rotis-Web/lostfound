import express, { Request, Response } from "express";
import axios from "axios";
import { z } from "zod";
import redis from "../config/redis";
import rateLimit from "express-rate-limit";

const router = express.Router();
const geoLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: { error: "Prea multe cereri, vă rugăm să încercați mai târziu" },
  standardHeaders: true,
  legacyHeaders: false,
});
router.use(geoLimiter);

const searchSchema = z.object({
  q: z.string().min(2),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => Math.min(parseInt(val), 20))
    .optional(),
});

const reverseSchema = z.object({
  lat: z.coerce.number().min(43.5).max(48.3),
  lon: z.coerce.number().min(20.2).max(29.7),
});

// router.get("/health", (_req: Request, res: Response) => {
//   res.json({ status: "ok" });
// });

router.get("/search", async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = searchSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { q, limit = 10 } = parsed.data;
    const cacheKey = `search:${q}:${limit}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      console.log("Cache hit");
      return;
    }

    const params = new URLSearchParams({
      format: "json",
      countrycodes: "ro",
      "accept-language": "ro",
      addressdetails: "1",
      dedupe: "1",
      limit: limit.toString(),
      autocomplete: "1",
      q,
    });

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        timeout: 5000,
        headers: {
          "User-Agent": "Lost&Found/1.0 (support@lostfound.ro)",
        },
      }
    );

    const sanitized = response.data.map((item: any) => ({
      display_name: item.display_name,
      lat: item.lat,
      lon: item.lon,
      type: item.type,
      importance: item.importance,
    }));

    await redis.set(cacheKey, JSON.stringify(sanitized), "EX", 3600);

    res.json(sanitized);
  } catch (error: any) {
    console.error("Geocoding error:", error.message);

    if (error.code === "ECONNABORTED") {
      res.status(408).json({ error: "Request timeout" });
      return;
    }
    if (error.response?.status === 429) {
      res.status(429).json({ error: "Limita de cereri a fost depășită" });
      return;
    }
    res.status(500).json({ error: "Eroare în serviciul de geocodare" });
  }
});

router.get("/reverse", async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = reverseSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { lat, lon } = parsed.data;

    if (lat < 43.5 || lat > 48.3 || lon < 20.2 || lon > 29.7) {
      res.status(400).json({ error: "Coordonatele nu sunt în România" });
      return;
    }

    const cacheKey = `reverse:${lat}:${lon}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      res.json(JSON.parse(cached));
      console.log("Cache hit");
      return;
    }

    const params = new URLSearchParams({
      format: "json",
      lat: lat.toString(),
      lon: lon.toString(),
      "accept-language": "ro",
      addressdetails: "1",
    });

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?${params}`,
      {
        timeout: 5000,
        headers: {
          "User-Agent": "Lost&Found/1.0 (support@lostfound.ro)",
        },
      }
    );

    const locationData = {
      display_name:
        response.data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
      address: response.data.address || {},
      lat,
      lon,
    };

    await redis.set(cacheKey, JSON.stringify(locationData), "EX", 3600);

    res.json(locationData);
  } catch (error: any) {
    console.error("Reverse geocoding error:", error.message);

    if (error.code === "ECONNABORTED") {
      res.status(408).json({ error: "Request timeout" });
      return;
    }

    if (error.response?.status === 429) {
      res.status(429).json({
        error: "Limita de cereri a fost depășită, încercați mai târziu",
      });
      return;
    }

    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    res.json({
      display_name: `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
      address: {},
      lat,
      lon,
    });
  }
});

export default router;
