import { z } from "zod";

export const profileSchema = z.object({
  businessName: z.string().min(2).max(100),
});
export type ProfileInput = z.infer<typeof profileSchema>;