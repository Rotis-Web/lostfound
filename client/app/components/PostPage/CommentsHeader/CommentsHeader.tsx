"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import styles from "./CommentsHeader.module.scss";
import { Post } from "@/types/Post";
import { usePosts } from "@/context/PostsContext";
import { useAuth } from "@/context/AuthContext";

interface CommentError {
  code?: string;
  message: string;
  field?: string;
  errors?: Array<{ field: string; message: string }>;
}

interface FieldErrors {
  content?: string;
  general?: string;
}

export default function CommentsHeader({ post }: { post: Post }) {
  const { createComment } = usePosts();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!content.trim()) {
      newErrors.content = "Comentariul este obligatoriu";
    } else if (content.trim().length < 3) {
      newErrors.content = "Comentariul trebuie să aibă cel puțin 3 caractere";
    } else if (content.trim().length > 1000) {
      newErrors.content = "Comentariul trebuie să aibă cel mult 1000 caractere";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddComment = () => {
    if (!user) {
      toast.info("Doar utilizatorii autentificați pot adăuga comentarii");
      return;
    }
    setShowForm(true);
    setErrors({});
  };
  const clearError = (field: keyof FieldErrors) => {
    if (errors[field] || errors.general) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
        general: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      toast.error("Vă rugăm să completați toate câmpurile obligatorii");
      return;
    }

    if (!user) {
      toast.error("Date lipsă pentru crearea comentariului");
      return;
    }

    setIsSubmitting(true);

    try {
      await createComment(post._id, content.trim(), user._id);
      setContent("");
      setShowForm(false);
      toast.success("Comentariul a fost adăugat cu succes!");

      // Optional: You might want to refresh the post data here
      // or trigger a re-fetch of comments
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        const error = err as CommentError;

        if (error.code === "VALIDATION_ERROR" && Array.isArray(error.errors)) {
          const fieldErrors: FieldErrors = {};
          error.errors.forEach(({ field, message }) => {
            fieldErrors[field as keyof FieldErrors] = message;
          });
          setErrors(fieldErrors);
        } else if (error.field && error.message) {
          setErrors({ [error.field]: error.message });
        } else {
          setErrors({
            general: error.message || "A apărut o eroare neașteptată",
          });
          toast.error(error.message || "A apărut o eroare neașteptată");
        }
      } else {
        setErrors({ general: "Eroare necunoscută" });
        toast.error("Eroare necunoscută");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent("");
    setShowForm(false);
    setErrors({});
  };

  return (
    <div className={styles.commentsheader}>
      <h2>
        {post.comments.length}{" "}
        {post.comments.length === 1 ? "Comentariu" : "Comentarii"}
      </h2>
      {!showForm ? (
        <button onClick={handleAddComment}>
          <span>+ </span>
          Adaugă comentariu
        </button>
      ) : (
        <form onSubmit={handleSubmit} className={styles.commentform}>
          <div className={styles.inputcontainer}>
            <textarea
              value={content}
              name="content"
              id="content"
              onChange={(e) => {
                setContent(e.target.value);
                clearError("content");
              }}
              placeholder="Scrie comentariul tău..."
              className={`${styles.commentinput} ${
                errors.content ? styles.error : ""
              }`}
              rows={3}
              maxLength={1000}
              disabled={isSubmitting}
              autoFocus
              area-label="Comentariu"
            />
            <div className={styles.charactercount}>{content.length}/1000</div>
            {errors.content && (
              <div className={styles.errormessage}>{errors.content}</div>
            )}
          </div>
          {errors.general && (
            <div className={styles.generalerror}>{errors.general}</div>
          )}
          <div className={styles.buttoncontainer}>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelbutton}
              disabled={isSubmitting}
            >
              Anulează
            </button>
            <button
              type="submit"
              className={styles.submitbutton}
              disabled={
                isSubmitting || errors.content !== undefined || !content
              }
            >
              {isSubmitting ? "Se trimite..." : "Trimite comentariu"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
