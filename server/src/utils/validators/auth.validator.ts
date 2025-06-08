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
