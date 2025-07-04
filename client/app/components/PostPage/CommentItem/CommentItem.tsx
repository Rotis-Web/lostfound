"use client";

import styles from "./CommentItem.module.scss";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import UserLink from "../UserLink/UserLink";
import { Post } from "@/types/Post";
import { usePosts } from "@/context/PostsContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

interface Props {
  comment: Post["comments"][number];
  timeAgo: string;
}

interface deleteError {
  message: string;
}

export default function CommentItem({ comment, timeAgo }: Props) {
  const { deleteComment } = usePosts();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const handleCommentDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteComment(comment._id);
      toast.success(response.message || "Comentariul a fost șters cu succes");
    } catch (err: unknown) {
      const error = err as deleteError;
      console.error("Error deleting comment:", error);
      toast.error(error.message || "Eroare la ștergerea comentariului");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.comment}>
      <div className={styles.commentinfo}>
        <div className={styles.author}>
          <Image
            src={comment.author?.profileImage || "/icons/user-icon.svg"}
            alt="Profile Icon"
            width={25}
            height={25}
          />
          {comment.author ? (
            <UserLink name={comment.author.name} id={comment.author._id} />
          ) : (
            <b className={styles.deleted}>Utilizator șters</b>
          )}
        </div>
        <p>{timeAgo}</p>
      </div>
      <p>
        {comment.content} Lorem ipsum dolor sit amet consectetur adipisicing
        elit. Saepe, vel autem officia, eum nemo veritatis numquam dolorum
        temporibus reprehenderit hic rem consequatur nobis expedita nam
        voluptate obcaecati in, enim mollitia? asda da da da sd ad21
      </p>

      <div className={styles.optionswrapper} ref={menuRef}>
        <button
          className={styles.optionsbutton}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <Image
            src="/icons/options.svg"
            alt="Options"
            width={15}
            height={15}
          />
        </button>

        {menuOpen && (
          <div className={styles.menu}>
            {(user?._id !== comment.author?._id || !user) && (
              <button type="button" className={styles.menuitem}>
                <Image
                  src="/icons/report.svg"
                  alt="Report"
                  width={15}
                  height={15}
                />
                Raportează
              </button>
            )}
            {user?._id === comment.author?._id && user && (
              <button
                type="button"
                className={styles.menuitem}
                onClick={handleCommentDelete}
                disabled={isDeleting}
              >
                <Image
                  src="/icons/delete-red.svg"
                  alt="Delete"
                  width={15}
                  height={15}
                />
                Șterge
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
