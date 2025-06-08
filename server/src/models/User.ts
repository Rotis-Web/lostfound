import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  lostfoundID: string;
  role: "user" | "admin";
  profileImage?: string;
  bio?: string;
  badges?: string[];
  favoritePosts?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  validatePassword: (password: string) => Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true, minlength: 3 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    lostfoundID: { type: String, unique: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profileImage: { type: String },
    bio: {
      type: String,
      maxLength: 500,
      default: "",
    },
    badges: [
      {
        type: String,
      },
    ],
    favoritePosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this as UserDocument;
  if (!user.isModified("password")) return next();
  user.password = await bcrypt.hash(user.password, 10);
  next();
});

userSchema.pre("save", function (next) {
  const user = this as UserDocument;
  if (!user.profileImage) {
    const encodedName = encodeURIComponent(user.name.trim());
    user.profileImage = `https://ui-avatars.com/api/?name=${encodedName}&background=random&bold=true`;
  }
  next();
});

function generateUserId(length = 5) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return `#${id}`;
}

userSchema.pre("save", async function (next) {
  if (this.isNew && !this.lostfoundID) {
    let unique = false;
    while (!unique) {
      const id = generateUserId();
      const existing = await mongoose.models.User.findOne({ lostfoundID: id });
      if (!existing) {
        this.lostfoundID = id;
        unique = true;
      }
    }
  }
  next();
});

userSchema.methods.validatePassword = function (
  this: UserDocument,
  password: string
) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<UserDocument>("User", userSchema);
