"use client";

import styles from "./SavedPosts.module.scss";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Post } from "@/types/Post";
import PostCard from "../../UI/PostCard/PostCard";

export default function SavedPosts() {
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const { user, getUserSavedPosts } = useAuth();

  const fetchSavedPosts = useCallback(async () => {
    try {
      const savedPosts = await getUserSavedPosts();
      setSavedPosts(savedPosts || []);
    } catch (error) {
      console.error("Erroare la încarcarea postărilor:", error);
    }
  }, [getUserSavedPosts]);

  useEffect(() => {
    if (user) fetchSavedPosts();
  }, [user, fetchSavedPosts]);

  if (savedPosts.length === 0 || !savedPosts) {
    return (
      <div className={styles.emptyposts}>Aici vor apărea postările salvate</div>
    );
  }

  return (
    <div className={styles.savedPosts}>
      {savedPosts.map((post) => (
        <PostCard key={post._id} post={post} priority />
      ))}
    </div>
  );
}
