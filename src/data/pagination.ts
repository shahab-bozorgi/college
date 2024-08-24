import { z } from "zod";
import { zodInt, zodPositiveInt } from "./int";

export const paginationSchema = z.object({
  page: zodPositiveInt.optional(),
  limit: zodPositiveInt.optional(),
});

export type Pagination = z.infer<typeof paginationSchema>;
