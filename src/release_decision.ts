import { z } from "zod";

export const transcriptionRequest = z.object({
  text: z.string().min(1),
  eventId: z.string().min(1),
  service: z.enum(["build", "release", "diagnostic"])
});

export type TranscriptionRequest = z.infer<typeof transcriptionRequest>;

export type ReleaseAction = "release" | "hold" | "diagnose";

export function chooseAction(text: string, service: TranscriptionRequest["service"]): ReleaseAction {
  const normalized = text.toLowerCase();
  if (service === "diagnostic" || normalized.includes("error") || normalized.includes("failed")) return "diagnose";
  if (service === "release" && (normalized.includes("approved") || normalized.includes("ship"))) return "release";
  return "hold";
}
