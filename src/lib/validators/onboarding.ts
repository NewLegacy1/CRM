import { z } from "zod";

export const onboardingLineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().int().positive(),
  unit_amount: z.number().nonnegative(),
});

export const onboardingPayloadSchema = z.object({
  pagesAndSections: z.string().optional(),
  copyNotes: z.string().optional(),
  brandColors: z.string().optional(),
  domainHosting: z.string().optional(),
  socialLinks: z.string().optional(),
});

export const onboardingSubmitSchema = z.object({
  signerName: z.string().min(2, "Enter your full legal name"),
  agreed: z.literal(true, { message: "You must accept the agreement" }),
  payload: onboardingPayloadSchema,
  logoUrls: z.array(z.string().url()).max(5).default([]),
  imageUrls: z.array(z.string().url()).max(20).default([]),
});

export type OnboardingSubmitInput = z.infer<typeof onboardingSubmitSchema>;

export const createOnboardingLinkSchema = z.object({
  businessName: z.string().min(1),
  contactName: z.string().optional(),
  email: z.string().email(),
  clientId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  currency: z.string().length(3).default("cad"),
  lineItems: z.array(onboardingLineItemSchema).min(1),
});

export type CreateOnboardingLinkInput = z.infer<
  typeof createOnboardingLinkSchema
>;
