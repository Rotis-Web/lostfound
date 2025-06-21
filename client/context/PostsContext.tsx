"use client";

import { createContext, useContext, useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Post {
  _id: string;
  author: string;
  lostfoundID: string;
  title: string;
  content: string;
  tags?: string[];
  images: string[];
  status: "found" | "lost" | "solved";
  name: string;
  email: string;
  phone: string;
  lastSeen?: Date;
  location: string;
  locationCoordinates: { type: "Point"; coordinates: [number, number] };
  circleRadius: number;
  promoted: {
    isActive: boolean;
    expiresAt?: Date;
  };
  reward?: number;
  comments: string[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

interface PostsProviderProps {
  children: React.ReactNode;
}

interface PostsProviderType {}

const PostsContext = createContext<PostsProviderType>({} as PostsProviderType);

const PostsProvider = ({ children }: PostsProviderProps) => {
  
    const createPost =async (data: any) => {
      try {
        const response = await fetch(`${API_URL}/posts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        return result;
      } catch (error) {
        console.error("Error creating post:", error);
        throw error;
      }
    };

  return (
    <PostsContext.Provider value={{ createPost }}>
      {children}
    </PostsContext.Provider>
  );