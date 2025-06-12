import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .pipe(z.string().min(1, "Numele este obligatoriu"))
    .pipe(z.string().min(3, "Numele trebuie sa aibă cel puțin 3 caractere"))
    .pipe(z.string().max(40, "Numele trebuie sa aibă cel mult 40 caractere")),
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

export const deleteAccountSchema = z.object({
  password: z
    .string()
    .trim()
    .pipe(
      z.string().min(1, "Parola este obligatorie pentru ștergerea contului")
    ),
  confirmationText: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Textul de confirmare este obligatoriu"))
    .refine((text) => text === "STERGE CONTUL", {
      message: "Trebuie să introduceți exact 'STERGE CONTUL' pentru confirmare",
    }),
  dataSecurityConfirmed: z.boolean().refine((confirmed) => confirmed === true, {
    message:
      "Trebuie să confirmați că ați citit Politica de Securitate a Datelor",
  }),
});

export const emailSchema = z.object({
  email: z.string().email("Adresa de email nu este validă"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token este obligatoriu"),
    password: z
      .string()
      .trim()
      .pipe(z.string().min(1, "Parola este obligatorie"))
      .pipe(z.string().min(6, "Parola trebuie sa aibă cel puțin 6 caractere"))
      .pipe(
        z.string().max(255, "Parola trebuie sa aibă cel mult 255 caractere")
      ),
    confirmPassword: z
      .string()
      .trim()
      .pipe(z.string().min(1, "Confirmarea parolei este obligatorie")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Parolele nu se potrivesc",
    path: ["confirmPassword"],
  });
