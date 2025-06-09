import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .pipe(z.string().min(1, "Numele este obligatoriu"))
    .pipe(z.string().min(3, "Numele trebuie sa aibă cel puțin 3 caractere"))
    .pipe(z.string().max(30, "Numele trebuie sa aibă cel mult 30 caractere")),
  email: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Email-ul este obligatoriu"))
    .pipe(
      z.string().max(255, "Email-ul trebuie sa aibă cel mult 255 caractere")
    )
    .pipe(z.string().email("Email-ul nu este valid")),
  password: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Parola este obligatorie"))
    .pipe(z.string().min(6, "Parola trebuie sa aibă cel puțin 6 caractere"))
    .pipe(z.string().max(255, "Parola trebuie sa aibă cel mult 255 caractere")),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Email-ul este obligatoriu"))
    .pipe(
      z.string().max(255, "Email-ul trebuie sa aibă cel mult 255 caractere")
    )
    .pipe(z.string().email("Email-ul nu este valid")),
  password: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Parola este obligatorie"))
    .pipe(z.string().min(6, "Parola trebuie sa aibă cel puțin 6 caractere"))
    .pipe(z.string().max(255, "Parola trebuie sa aibă cel mult 255 caractere")),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .trim()
      .pipe(z.string().min(1, "Parola veche este obligatorie")),
    newPassword: z
      .string()
      .trim()
      .pipe(z.string().min(1, "Parola nouă este obligatorie"))
      .pipe(
        z.string().min(6, "Parola nouă trebuie sa aibă cel puțin 6 caractere")
      )
      .pipe(
        z
          .string()
          .max(255, "Parola nouă trebuie sa aibă cel mult 255 caractere")
      ),
    confirmPassword: z
      .string()
      .trim()
      .pipe(z.string().min(1, "Confirmarea parolei este obligatorie")),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Parolele nu se potrivesc",
    path: ["confirmPassword"],
  });
