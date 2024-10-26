import { z } from "zod";

export const signupInput = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(3).optional(),
});

export const signinInput = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});


// zod type inferences
export type signupInput = z.infer<typeof signupInput>
export type signinInput = z.infer<typeof signinInput>