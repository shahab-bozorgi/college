import { NoneEmptyString } from "../../data/non-empty-string";
import { MIME } from "../../utilities/upload";
import { MediaId } from "./field-types/media-id";

export interface Media {
  id: MediaId;
  name: NoneEmptyString;
  mime: MIME;
  size: number;
  path: string;
}

export interface CreateMedia {
  name: NoneEmptyString;
  mime: MIME;
  size: number;
  path: string;
}
