import { Response, Request } from "express";
import Comment from "../models/Comment";
import Post from "../models/Post";

export async function createComment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const validatedData = req.body;
    const comment = await Comment.create(validatedData);

    const post = await Post.findById(comment.post);
    if (post) {
      post.comments.push(comment._id as any);
      await post.save();
    }

    res.status(201).json({ comment });
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Error creating comment" });
  }
}
