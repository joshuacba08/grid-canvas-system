import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const docs = defineCollection({
  loader: glob({
    base: "./src/content/docs",
    generateId: ({ data, entry }) =>
      typeof data.locale === "string" && typeof data.slug === "string"
        ? `${data.locale}/${data.slug}`
        : entry,
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    locale: z.enum(["en", "es"]),
    slug: z.literal("getting-started"),
    title: z.string(),
    summary: z.string(),
  }),
});

export const collections = { docs };