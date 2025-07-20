"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function SaveButton({
  postId,
  className,
}: {
  postId: string;
  className?: string;
}) {
  const [isSaved, setIsSaved] = useState(false);
  const { user, savePost, removeSavedPost } = useAuth();

  useEffect(() => {
    if (user && user.favoritePosts?.includes(postId)) {
      setIsSaved(true);
    } else {
      setIsSaved(false);
    }
  }, [user, postId]);

  const handleSave = async () => {
    if (!user) {
      toast.info("Trebuie sa fii autentificat pentru a salva postări");
      return;
    }
    if (isSaved) {
      await removeSavedPost(postId);
      setIsSaved(false);
      toast.success("Postarea a fost ștearsă cu succes");
    } else {
      await savePost(postId);
      setIsSaved(true);
      toast.success("Postarea a fost salvată cu succes");
    }
  };

  return (
    <button
      className={className}
      onClick={handleSave}
      title={`${isSaved ? "Șterge" : "Salvează"} postarea`}
    >
      <Image
        src={isSaved ? "/icons/saved.svg" : "/icons/save.svg"}
        alt="Saved Icon"
        width={20}
        height={20}
        draggable={false}
      />
      <p>{isSaved ? "Salvată" : "Salvează"}</p>
    </button>
  );
}
