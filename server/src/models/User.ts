import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

const userSchema = new Schema<UserDocument>({
  name: { type: String, required: true, trim: true, minlength: 3 },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.validatePassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<UserDocument>("User", userSchema);
