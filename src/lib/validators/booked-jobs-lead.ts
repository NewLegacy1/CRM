import { z } from "zod";

export const bookedJobsLeadSchema = z.object({
  funnel: z.literal("booked-jobs"),
  name: z.string().min(1, "Name is required"),
  businessName: z.string().min(1, "Business name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone is required"),
  trade: z.string().min(1, "Trade is required"),
  city: z.string().min(1, "City is required"),
  gbpStatus: z.enum(["yes", "no", "unsure"]),
  jobsGoal: z.string().min(1, "Tell us how many extra jobs you want"),
  readyToInvest: z.enum(["yes", "not_yet"]),
  sourcePath: z.string().optional(),
  headlineVariant: z.string().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent: z.string().optional(),
});

export type BookedJobsLeadInput = z.infer<typeof bookedJobsLeadSchema>;
