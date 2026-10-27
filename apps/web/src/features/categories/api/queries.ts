import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchCategories } from "./client";
import { categoryKeys } from "./keys";

export const categoriesQueryOptions = () =>
  queryOptions({ queryKey: categoryKeys.lists(), queryFn: fetchCategories });

export const useCategories = () => useQuery(categoriesQueryOptions());
