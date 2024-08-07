import { Brand } from "../utilities/brand";
import { isNoneEmptyString, NoneEmptyString } from "./non-empty-string";

export type SpecificLengthString = Brand<
  NoneEmptyString,
  "SpecificLengthString"
>;

export const isSpecificLengthString = (
  value: string,
  min: number,
  max: number
): value is SpecificLengthString => {
  return isNoneEmptyString(value) && value.length >= min && value.length <= max;
};
