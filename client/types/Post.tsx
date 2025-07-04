import { User } from "./User";
export interface Post {
  author: User;
  _id: string;
  lostfoundID: string;
  title: string;
  content: string;
  tags?: string[];
  images: string[];
  status: "found" | "lost" | "solved";
  name: string;
  email: string;
  phone: string;
  category: string;
  reward?: number;
  lastSeen?: Date;
  location: string;
  locationCoordinates: {
    type: "Point";
    coordinates: [number, number];
  };
  circleRadius: number;

  promoted: {
    isActive: boolean;
    expiresAt?: string;
  };
  comments: Comment[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

export interface Comment {
  _id: string;
  author: User;
  post: Post;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
