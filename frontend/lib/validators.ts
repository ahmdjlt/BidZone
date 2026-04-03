import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(2, "Username must be at least 2 characters")
      .max(50, "Username must be at most 50 characters"),
    fullName: z.string().max(100, "Full name must be at most 100 characters").optional(),
    email: z.string().email("Please enter a valid email address").max(100),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["Buyer", "Seller"]).default("Buyer"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const createAuctionSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().url("Must be a valid URL").max(500).optional().or(z.literal("")),
  startingPrice: z.number().positive("Starting price must be positive"),
  reservePrice: z.number().positive("Reserve price must be positive").optional(),
  endTime: z.string().min(1, "End time is required"),
  categoryId: z.number().int().positive("Please select a category"),
});

export const placeBidSchema = z.object({
  amount: z.number().positive("Bid amount must be positive"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateAuctionInput = z.infer<typeof createAuctionSchema>;
export type PlaceBidInput = z.infer<typeof placeBidSchema>;
