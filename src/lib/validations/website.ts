import { z } from "zod";
import { ScanFrequency } from "@prisma/client";
import { normalizeWebsiteUrl } from "@/lib/website-host";

export const websiteSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    url: z
      .string()
      .trim()
      .min(1, "Please enter a website URL.")
      .superRefine((val, ctx) => {
        if (!normalizeWebsiteUrl(val)) {
          ctx.addIssue({
            code: "custom",
            message: "Please enter a valid website URL.",
          });
        }
      })
      .transform((val) => normalizeWebsiteUrl(val) as string),
    scanFrequency: z.nativeEnum(ScanFrequency).default(ScanFrequency.MANUAL),
    scanTimezone: z.string().min(1).default("UTC"),
    scanTimeOfDay: z
      .string()
      .regex(/^\d{2}:\d{2}$/, "Use HH:MM format.")
      .default("09:00"),
    scanDayOfWeek: z.number().int().min(0).max(6).nullable().optional(),
    scanDayOfMonth: z.number().int().min(1).max(28).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.scanFrequency === ScanFrequency.WEEKLY && data.scanDayOfWeek == null) {
      ctx.addIssue({
        code: "custom",
        message: "Choose a day of the week for weekly scans.",
        path: ["scanDayOfWeek"],
      });
    }
    if (data.scanFrequency === ScanFrequency.MONTHLY && data.scanDayOfMonth == null) {
      ctx.addIssue({
        code: "custom",
        message: "Choose a day of the month for monthly scans.",
        path: ["scanDayOfMonth"],
      });
    }
  });

export type WebsiteFormValues = z.infer<typeof websiteSchema>;
