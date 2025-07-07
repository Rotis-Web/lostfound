import { Request, Response } from "express";
import Post from "../models/Post";
import { searchSchema } from "../utils/validators/search.validator";
import { z } from "zod";

type SearchQuery = z.infer<typeof searchSchema>;

export async function searchPosts(req: Request, res: Response) {
  try {
    const { query, category, status, lat, lon, radius, period, limit, skip } =
      req.query as unknown as SearchQuery;

    console.log("Search request received:", {
      query,
      category,
      status,
      lat,
      lon,
      radius,
      period,
      limit,
      skip,
    });

    const filters: any = { status: { $ne: "solved" } };

    if (query) filters.$text = { $search: query };
    if (category) filters.category = category;
    if (status) filters.status = { $in: status };

    if (lat !== undefined && lon !== undefined && radius !== undefined) {
      filters.locationCoordinates = {
        $geoWithin: {
          $centerSphere: [[lon, lat], radius / 6378.1],
        },
      };
    }

    if (period !== undefined) {
      const dateThreshold = new Date();
      dateThreshold.setMonth(dateThreshold.getMonth() - period);
      filters.createdAt = { $gte: dateThreshold };
    }

    console.log("MongoDB filters:", filters);

    // Get total count first
    const totalCount = await Post.countDocuments(filters);
    console.log("Total count:", totalCount);

    // For simplicity, let's treat all posts equally for now
    // You can add promoted posts logic back later once pagination works
    const posts = await Post.find(filters)
      .select(
        "title content images status category location createdAt lostfoundID promoted views lastSeen reward"
      )
      .sort(query ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log("Posts found:", posts.length);

    const response = {
      code: "SEARCH_RESULTS",
      posts,
      count: posts.length,
      totalCount,
      hasMore: skip + posts.length < totalCount,
      promotedCount: 0, // Simplified for now
    };

    console.log("Response:", {
      count: response.count,
      totalCount: response.totalCount,
      hasMore: response.hasMore,
      skip,
      limit,
    });

    res.status(200).json(response);
  } catch (err) {
    console.error("Error searching posts:", err);
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  }
}

export async function getCategories(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const categories = await Post.distinct("category", {
      status: { $ne: "solved" },
    });

    res.status(200).json({
      code: "CATEGORIES_FOUND",
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "Eroare internă de server",
    });
  }
}
