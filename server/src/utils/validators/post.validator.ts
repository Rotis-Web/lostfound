import { z } from "zod";

export const createPostSchema = z.object({
  author: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Autorul este obligatoriu"))
    .pipe(
      z.string().regex(/^[0-9a-fA-F]{24}$/, "ID-ul autorului nu este valid")
    ),
  title: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Titlul este obligatoriu"))
    .pipe(z.string().min(3, "Titlul trebuie să aibă cel puțin 3 caractere"))
    .pipe(z.string().max(100, "Titlul trebuie să aibă cel mult 100 caractere")),

  content: z
    .string()
    .trim()
    .pipe(
      z.string().max(1000, "Conținutul trebuie să aibă cel mult 1000 caractere")
    ),
  tags: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    },
    z
      .array(
        z
          .string()
          .trim()
          .min(1, "Tagurile trebuie să fie formate din cel puțin un caracter")
      )
      .max(20, "Maximum 20 taguri sunt permise")
      .optional()
      .default([])
  ),

  status: z.enum(["found", "lost"], {
    errorMap: () => ({
      message: "Status-ul trebuie să fie 'pierdut' sau 'găsit'",
    }),
  }),
  name: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Numele este obligatoriu"))
    .pipe(z.string().min(3, "Numele trebuie să aibă cel puțin 3 caractere"))
    .pipe(z.string().max(40, "Numele trebuie să aibă cel mult 40 caractere")),

  email: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Email-ul este obligatoriu"))
    .pipe(
      z.string().max(255, "Email-ul trebuie să aibă cel mult 255 caractere")
    )
    .pipe(z.string().email("Email-ul nu este valid")),

  phone: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Numărul de telefon este obligatoriu"))
    .pipe(
      z
        .string()
        .min(10, "Numărul de telefon trebuie să aibă cel puțin 10 cifre")
    )
    .pipe(
      z.string().max(15, "Numărul de telefon trebuie să aibă cel mult 15 cifre")
    )
    .pipe(
      z
        .string()
        .regex(
          /^[+]?[0-9\s\-()]+$/,
          "Numărul de telefon conține caractere invalide"
        )
    ),
  category: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Categoria este obligatorie"))
    .pipe(z.string().min(3, "Categoria trebuie să aibă cel puțin 3 caractere"))
    .pipe(
      z.string().max(40, "Categoria trebuie să aibă cel mult 40 caractere")
    ),
  lastSeen: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(new Date(val).getTime()), {
      message: "Data nu este validă",
    })
    .refine((val) => !val || new Date(val) <= new Date(), {
      message: "Data nu poate fi în viitor",
    }),
  standardImage: z
    .string()
    .url("Imaginea standard trebuie să fie un URL valid")
    .optional(),

  location: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Locația este obligatorie"))
    .pipe(z.string().min(3, "Locația trebuie să aibă cel puțin 3 caractere"))
    .pipe(
      z.string().max(200, "Locația trebuie să aibă cel mult 200 caractere")
    ),

  locationCoordinates: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    },
    z.object({
      type: z.literal("Point", {
        errorMap: () => ({
          message: "Tipul coordonatelor trebuie să fie 'Point'",
        }),
      }),
      coordinates: z
        .array(z.number())
        .length(
          2,
          "Coordonatele trebuie să conțină exact 2 valori [longitudine, latitudine]"
        )
        .refine(
          ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
          "Coordonatele nu sunt valide"
        ),
    })
  ),

  circleRadius: z.preprocess((val) => {
    if (typeof val === "string") {
      const parsed = Number(val);
      return isNaN(parsed) ? val : parsed;
    }
    return val;
  }, z.number().min(0, "Raza cercului trebuie să fie pozitivă").max(10000, "Raza cercului nu poate depăși 10km").int("Raza cercului trebuie să fie un număr întreg")),
  reward: z.preprocess((val) => {
    if (typeof val === "string") {
      const parsed = Number(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().min(0, "Recompensa trebuie să fie pozitivă").max(100000, "Recompensa nu poate depăși 100,000").optional()),
});

export const editPostSchema = createPostSchema
  .partial()
  .omit({ author: true })
  .extend({
    imageOperations: z.preprocess(
      (val) => {
        if (typeof val === "string") {
          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        }
        return val;
      },
      z
        .object({
          replaceAllImages: z.boolean().optional().default(false),
          imagesToRemove: z
            .array(z.string().url("URL-ul imaginii nu este valid"))
            .optional()
            .default([]),
        })
        .optional()
    ),
  });

export const createCommentSchema = z.object({
  author: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Autorul este obligatoriu"))
    .pipe(
      z.string().regex(/^[0-9a-fA-F]{24}$/, "ID-ul autorului nu este valid")
    ),
  post: z
    .string()
    .trim()
    .pipe(z.string().min(1, "ID-ul postului este obligatoriu"))
    .pipe(
      z.string().regex(/^[0-9a-fA-F]{24}$/, "ID-ul postului nu este valid")
    ),
  content: z
    .string()
    .trim()
    .pipe(z.string().min(1, "Comentariul este obligatoriu"))
    .pipe(
      z
        .string()
        .max(1000, "Comentariul trebuie sa aibă cel mult 1000 caractere")
    )
    .pipe(
      z.string().min(3, "Comentariul trebuie sa aibă cel puțin 3 caractere")
    ),
});

// export const updatePostSchema = createPostSchema
//   .partial()
//   .omit({ author: true });

// export const getPostSchema = z.object({
//   id: z
//     .string()
//     .trim()
//     .pipe(z.string().min(1, "ID-ul postării este obligatoriu"))
//     .pipe(
//       z.string().regex(/^[0-9a-fA-F]{24}$/, "ID-ul postării nu este valid")
//     ),
// });

// export const getPostsSchema = z.object({
//   page: z
//     .string()
//     .optional()
//     .transform((val) => (val ? parseInt(val) : 1))
//     .refine((val) => val > 0, "Pagina trebuie să fie un număr pozitiv"),

//   limit: z
//     .string()
//     .optional()
//     .transform((val) => (val ? parseInt(val) : 10))
//     .refine(
//       (val) => val > 0 && val <= 100,
//       "Limita trebuie să fie între 1 și 100"
//     ),

//   status: z.enum(["found", "lost", "solved"]).optional(),

//   search: z
//     .string()
//     .trim()
//     .min(1, "Termenul de căutare trebuie să aibă cel puțin 1 caracter")
//     .max(100, "Termenul de căutare trebuie să aibă cel mult 100 caractere")
//     .optional(),

//   tags: z
//     .string()
//     .optional()
//     .transform((val) =>
//       val ? val.split(",").map((tag) => tag.trim()) : undefined
//     ),

//   location: z
//     .object({
//       latitude: z.number().min(-90).max(90),
//       longitude: z.number().min(-180).max(180),
//       radius: z.number().min(1).max(50000),
//     })
//     .optional(),
// });
