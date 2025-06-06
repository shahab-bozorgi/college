import { NoneEmptyString } from "../../../data/non-empty-string";
import { MediaId } from "./media-id";
import { MIME } from "./mime";

export interface Media {
  id: MediaId;
  name: NoneEmptyString;
  mime: MIME;
  size: number;
  path: string;
  url: string;
}

export interface CreateMedia {
  name: NoneEmptyString;
  mime: MIME;
  size: number;
  path: string;
}
