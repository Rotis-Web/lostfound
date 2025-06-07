import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Email is required"))
    .pipe(z.string().max(255, "Email must be at most 255 characters"))
    .pipe(z.string().email("Invalid email address")),
  password: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Password is required"))
    .pipe(z.string().min(6, "Password must be at least 6 characters"))
    .pipe(z.string().max(255, "Password must be at most 255 characters")),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Email is required"))
    .pipe(z.string().max(255, "Email must be at most 255 characters"))
    .pipe(z.string().email("Invalid email address")),
  password: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Password is required"))
    .pipe(z.string().min(6, "Password must be at least 6 characters"))
    .pipe(z.string().max(255, "Password must be at most 255 characters")),
});
