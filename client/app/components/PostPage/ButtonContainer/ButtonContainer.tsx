"use client";

import styles from "./ButtonContainer.module.scss";
import { useEffect, useRef, useState } from "react";
import { Post } from "@/types/Post";
import ContactButton from "../ContactButton/ContactButton";
import ShareButton from "../ShareButton/ShareButton";
import SaveButton from "../SaveButton/SaveButton";
import PrintButton from "../PrintButton/PrintButton";

interface ButtonContainerProps {
  post: Post;
}

export default function ButtonContainer({ post }: ButtonContainerProps) {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [isFixed, setIsFixed] = useState(false);
  const [originalTop, setOriginalTop] = useState(0);

  useEffect(() => {
    if (!buttonContainerRef.current) return;

    const rect = buttonContainerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    setOriginalTop(rect.top + scrollTop);
  }, []);

  useEffect(() => {
    function onScroll() {
      if (!buttonContainerRef.current) return;
      if (window.innerWidth >= 1200) {
        setIsFixed(false);
        return;
      }

      const scrollY = window.scrollY || window.pageYOffset;
      const headerHeight = 60;

      if (scrollY + headerHeight >= originalTop) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [originalTop]);
  return (
    <div
      className={`${styles.buttoncontainer} ${isFixed && styles.fixed}`}
      ref={buttonContainerRef}
    >
      {post.status != "solved" && (
        <ContactButton
          postId={post._id}
          email={post.email}
          phone={post.phone}
          className={styles.contact}
        />
      )}
      <ShareButton
        postId={post._id}
        className={`${styles.secbutton} ${
          post.status === "solved" && styles.large
        }`}
      />
      <PrintButton
        post={post}
        className={`${styles.secbutton} ${
          post.status === "solved" && styles.large
        }`}
      />
      <SaveButton
        postId={post._id}
        className={`${styles.secbutton} ${
          post.status === "solved" && styles.large
        }`}
      />
    </div>
  );
}
