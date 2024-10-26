import { z } from "zod";

// Define zod schema
export const createBlogInput = z.object({
    title: z.string(),
    content: z.string(),
})

export const updateBlogInput = z.object({
    title: z.string().optional(),
    content: z.string().optional(),
})


// type inferences for zod types
export type createBlogInput = z.infer<typeof createBlogInput>

export type updateBlogInput = z.infer<typeof updateBlogInput>