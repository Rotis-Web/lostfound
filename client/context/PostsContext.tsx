"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { Post } from "../types/Post";
import { Comment } from "../types/Post";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CreatePostData {
  author: string;
  title: string;
  content: string;
  tags?: string[];
  status: "found" | "lost" | "solved";
  name: string;
  email: string;
  phone: string;
  category: string;
  lastSeen?: Date;
  location: string;
  locationCoordinates: { type: "Point"; coordinates: [number, number] };
  circleRadius: number;
  reward?: number;
  images: File[];
}

interface EditPostData extends Partial<Omit<CreatePostData, "images">> {
  author: string;
  title: string;
  content: string;
  tags?: string[];
  status: "found" | "lost" | "solved";
  name: string;
  email: string;
  phone: string;
  category: string;
  lastSeen?: Date;
  location: string;
  locationCoordinates: { type: "Point"; coordinates: [number, number] };
  circleRadius: number;
  reward?: number;
  images?: File[];
  imageOperations?: {
    replaceAllImages?: boolean;
    imagesToRemove?: string[];
  };
}

interface CreatePostResponse {
  code: string;
  message: string;
  postID: string;
  uploadedImages: number;
}

interface EditPostResponse {
  code: string;
  message: string;
  post: Post;
  imagesAdded: number;
  imagesRemoved: number;
}

interface DeletePostResponse {
  code: string;
  message: string;
}

interface GetPostByIDResponse {
  code: string;
  message: string;
  post: Post;
}

interface MarkPostSolvedResponse {
  code: string;
  message: string;
  post: Post;
}

interface CreateCommentResponse {
  comment: Comment;
  code?: string;
  message?: string;
}

interface PostsProviderProps {
  children: ReactNode;
}

interface PostsContextType {
  createPost: (postData: CreatePostData) => Promise<CreatePostResponse>;
  getUserPosts: () => Promise<void>;
  deletePost: (postID: string) => Promise<DeletePostResponse>;
  editPost: (id: string, data: EditPostData) => Promise<EditPostResponse>;
  getPostByID: (postID: string) => Promise<GetPostByIDResponse>;
  setUserPosts: (posts: Post[]) => void;
  markPostSolved: (postID: string) => Promise<MarkPostSolvedResponse>;
  createComment: (
    postId: string,
    author: string,
    content: string
  ) => Promise<CreateCommentResponse>;
  userPosts: Post[];
  loading: boolean;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

export const PostsProvider = ({ children }: PostsProviderProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const { accessToken: token } = useAuth();

  const createPost = useCallback(
    async (postData: CreatePostData): Promise<CreatePostResponse> => {
      setLoading(true);

      try {
        const formData = new FormData();

        formData.append("author", postData.author);
        formData.append("title", postData.title);
        formData.append("content", postData.content);
        formData.append("status", postData.status);
        formData.append("name", postData.name);
        formData.append("email", postData.email);
        formData.append("phone", postData.phone);
        formData.append("category", postData.category);
        formData.append("location", postData.location);
        formData.append(
          "locationCoordinates",
          JSON.stringify(postData.locationCoordinates)
        );
        formData.append("circleRadius", postData.circleRadius.toString());

        if (postData.tags) {
          formData.append("tags", JSON.stringify(postData.tags));
        }
        if (postData.lastSeen) {
          formData.append("lastSeen", postData.lastSeen.toISOString());
        }
        if (postData.reward) {
          formData.append("reward", postData.reward.toString());
        }

        postData.images.forEach((image: File) => {
          formData.append("images", image);
        });

        const res = await fetch(`${API_URL}/post/create`, {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        const responseData = await res.json();
        setLoading(false);

        if (!res.ok) {
          const errorObj = {
            message:
              responseData.message ||
              responseData.error ||
              "Post creation failed",
            code: responseData.code || "UNKNOWN_ERROR",
            errors: responseData.errors || null,
            field: responseData.errors?.[0]?.field || null,
          };
          throw errorObj;
        }

        return responseData;
      } catch (error: unknown) {
        setLoading(false);
        console.error("Error creating post:", error);
        throw error;
      }
    },
    [token]
  );

  const getUserPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/post/user-posts`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch user posts");
      const responseData = await res.json();
      const sortedPosts = responseData.posts.sort((a: Post, b: Post) => {
        if (a.status === "solved" && b.status !== "solved") return 1;
        if (a.status !== "solved" && b.status === "solved") return -1;

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

      setUserPosts(sortedPosts);
    } catch (error: unknown) {
      console.error("Error fetching user posts:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const deletePost = useCallback(
    async (postId: string): Promise<DeletePostResponse> => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/post/delete/${postId}`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const responseData = await res.json();

        if (!res.ok) {
          const errorObj = {
            message:
              responseData.message ||
              responseData.error ||
              "Post deletion failed",
            code: responseData.code || "UNKNOWN_ERROR",
          };
          throw errorObj;
        }

        setUserPosts((prevPosts) =>
          prevPosts.filter((post) => post._id !== postId)
        );

        setLoading(false);
        return responseData;
      } catch (error: unknown) {
        setLoading(false);
        console.error("Error deleting post:", error);
        throw error;
      }
    },
    [token]
  );

  const editPost = useCallback(
    async (
      postId: string,
      postData: EditPostData
    ): Promise<EditPostResponse> => {
      setLoading(true);

      try {
        const formData = new FormData();

        formData.append("author", postData.author);
        formData.append("title", postData.title);
        formData.append("content", postData.content);
        formData.append("status", postData.status);
        formData.append("name", postData.name);
        formData.append("email", postData.email);
        formData.append("phone", postData.phone);
        formData.append("category", postData.category);
        formData.append("location", postData.location);
        formData.append(
          "locationCoordinates",
          JSON.stringify(postData.locationCoordinates)
        );
        formData.append("circleRadius", postData.circleRadius.toString());

        if (postData.tags) {
          formData.append("tags", JSON.stringify(postData.tags));
        }
        if (postData.lastSeen) {
          formData.append("lastSeen", postData.lastSeen.toISOString());
        }
        if (postData.reward) {
          formData.append("reward", postData.reward.toString());
        } else {
          formData.append("reward", "");
        }

        postData.images?.forEach((image: File) => {
          formData.append("images", image);
        });

        if (postData.imageOperations) {
          formData.append(
            "imageOperations",
            JSON.stringify(postData.imageOperations)
          );
        }
        console.log(postData);
        const res = await fetch(`${API_URL}/post/edit/${postId}`, {
          method: "PUT",
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const responseData = await res.json();
        if (!res.ok) {
          const errorObj = {
            message:
              responseData.message ||
              responseData.error ||
              "Editarea postării a eșuat",
            code: responseData.code || "UNKNOWN_ERROR",
            errors: responseData.errors || null,
            field: responseData.errors?.[0]?.field || null,
          };
          throw errorObj;
        }

        setUserPosts((prev) =>
          prev.map((p) => (p._id === postId ? responseData.post : p))
        );

        return responseData;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const getPostByID = useCallback(async (postId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/post/${postId}`, {
        method: "GET",
        credentials: "include",
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error("Failed to fetch post");
      }

      return responseData;
    } catch (error: unknown) {
      console.error("Error fetching post:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const markPostSolved = useCallback(
    async (postId: string): Promise<MarkPostSolvedResponse> => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/post/solve/${postId}`, {
          method: "PATCH",
          credentials: "include",
          headers: { Authorization: `Bearer ${token}` },
        });
        const responseData = await res.json();
        if (!res.ok) {
          const errorObj = {
            message:
              responseData.message ||
              responseData.error ||
              "Markarea postării a eșuat",
            code: responseData.code || "UNKNOWN_ERROR",
            errors: responseData.errors || null,
            field: responseData.errors?.[0]?.field || null,
          };
          throw errorObj;
        }
        setUserPosts((prev) =>
          prev.map((p) => (p._id === postId ? responseData.post : p))
        );
        return responseData;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const createComment = useCallback(
    async (postId: string, content: string, user: string) => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/comment/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify({ post: postId, content, author: user }),
        });

        const responseData = await res.json();

        if (!res.ok) {
          const errorObj = {
            message:
              responseData.message ||
              responseData.error ||
              "Comentarea postării a eșuat",
            code: responseData.code || "UNKNOWN_ERROR",
            errors: responseData.errors || null,
            field: responseData.errors?.[0]?.field || null,
          };
          throw errorObj;
        }

        return responseData;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  return (
    <PostsContext.Provider
      value={{
        createPost,
        getUserPosts,
        deletePost,
        editPost,
        getPostByID,
        setUserPosts,
        markPostSolved,
        createComment,
        userPosts,
        loading,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = (): PostsContextType => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within a PostsProvider");
  }
  return context;
};
