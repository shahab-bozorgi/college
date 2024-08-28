import { z } from "zod";
import { zodPositiveInt } from "./int";

export const paginationSchema = z.object({
  page: zodPositiveInt,
  limit: zodPositiveInt,
});

export type Pagination = z.infer<typeof paginationSchema>;
