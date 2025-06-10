import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";

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
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  validatePassword: (password: string) => Promise<boolean>;
  generateEmailVerificationToken: () => string;
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
      index: true,
    },
    password: { type: String, required: true },
    lostfoundID: { type: String, unique: true, required: false, index: true },
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
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  const user = this as UserDocument;

  if (user.isNew && !user.lostfoundID) {
    let unique = false;
    while (!unique) {
      const id = generateUserId();
      const existing = await mongoose.models.User.findOne({ lostfoundID: id });
      if (!existing) {
        user.lostfoundID = id;
        unique = true;
      }
    }
  }

  if (!user.profileImage) {
    const encodedName = encodeURIComponent(user.name.trim());
    user.profileImage = `https://ui-avatars.com/api/?name=${encodedName}&background=random&bold=true`;
  }

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
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

userSchema.methods.validatePassword = function (
  this: UserDocument,
  password: string
) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};

export default mongoose.model<UserDocument>("User", userSchema);
