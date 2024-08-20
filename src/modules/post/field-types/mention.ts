import { z } from "zod";
import { Username } from "../../user/model/user-username";
import { Brand } from "../../../utilities/brand";

export type MentionString = Brand<string, "MentionString">;
export const isZodMentionString = (value: string): value is MentionString =>
  /^(@[A-Za-z\d]+( |$))+$/.test(value);

export const zodMention = z.string().refine(isZodMentionString, {
  message: "Mention string format is not correct.",
});

export const parseMention = (value: MentionString): Username[] => {
  return value
    .trim()
    .split(" ")
    .filter(
      (mention, i, mentions) =>
        mentions.findIndex((val) => mention === val) === i
    )
    .map((mention) => mention.slice(1).toLowerCase() as Username);
};
