import { defineCollection, z } from "astro:content";

export const posts = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z
      .string()
      .regex(/^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
        message: "Should be in this format: YYYY-MM-DD",
      })
      .transform((value) => new Date(value)),
    description: z.string(),
    tags: z.array(z.string()),
  }),
});

export const collections = { posts };
