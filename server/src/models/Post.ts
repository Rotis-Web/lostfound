import mongoose, { Document, Schema } from "mongoose";

interface PostDocument extends Document {
  author: mongoose.Types.ObjectId;
  lostfoundID: string;
  title: string;
  content: string;
  tags?: string[];
  images: string[];
  status: "found" | "lost" | "solved";
  email: string;
  phone: string;
  lastSeen: Date;
  location: string;
  locationCoordinates: { type: "Point"; coordinates: [number, number] };
  circleRadius: number;
  promoted: {
    isActive: boolean;
    expiresAt?: Date;
  };
  comments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<PostDocument>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lostfoundID: { type: String, unique: true, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }],
    images: [{ type: String, required: true }],
    status: {
      type: String,
      enum: ["found", "lost", "solved"],
      required: true,
      index: true,
    },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    lastSeen: { type: Date, default: Date.now, required: true, index: true },
    location: { type: String, required: true },
    locationCoordinates: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (v: number[]) => v.length === 2,
          message: (props) =>
            `${props.value} must be a [longitude, latitude] pair`,
        },
      },
    },
    circleRadius: { type: Number, required: true, min: 0 },
    promoted: {
      isActive: { type: Boolean, default: false, index: true },
      expiresAt: { type: Date },
    },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

// Full-text search index for title, content, and tags
postSchema.index({ title: "text", content: "text", tags: "text" });

// Indexes for filtering and sorting
postSchema.index({ status: 1 });
postSchema.index({ "promoted.isActive": 1 });
postSchema.index({ lastSeen: -1 });

// 2dsphere index for location-based search
postSchema.index({ locationCoordinates: "2dsphere" });

// Optional: index for createdAt if you want to sort by newest posts
postSchema.index({ createdAt: -1 });

function generatePostId(length = 5) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `#${id}`;
}

postSchema.pre("save", async function (next) {
  if (this.isNew && !this.lostfoundID) {
    let unique = false;
    while (!unique) {
      const id = generatePostId();
      const existing = await mongoose.models.Post.findOne({ lostfoundID: id });
      if (!existing) {
        this.lostfoundID = id;
        unique = true;
      }
    }
  }
  next();
});

export default mongoose.model<PostDocument>("Post", postSchema);
