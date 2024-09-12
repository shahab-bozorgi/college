import { z } from "zod";
import { Brand } from "../../../../utilities/brand";

export type MentionString = Brand<string, "MentionString">;
export const isMentionString = (value: string): value is MentionString =>
  /^(@[A-Za-z\d]+( |$))+$/.test(value);

export const zodMentionString = z
  .string()
  .refine((value) => value === "" || isMentionString(value), {
    message: "Mention string format is not correct.",
  });
