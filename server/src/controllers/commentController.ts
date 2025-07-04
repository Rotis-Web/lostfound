import { Request, Response } from "express";
import mongoose from "mongoose";
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
    res.status(500).json({ error: "Eroare în crearea comentariului" });
  }
}

export async function deleteComment(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.user!.id;
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      res.status(400).json({ error: "ID comentariu invalid" });
      return;
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404).json({ error: "Comentariul nu a fost găsit" });
      return;
    }

    if (comment.author.toString() !== userId) {
      res.status(403).json({
        error: "Nu aveți permisiunea să ștergeți acest comentariu",
      });
      return;
    }

    await Comment.findByIdAndDelete(commentId);

    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id },
    });

    res.status(200).json({ message: "Comentariul a fost șters cu succes" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Eroare în ștergerea comentariului" });
  }
}
