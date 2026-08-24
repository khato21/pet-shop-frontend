import type { Category } from "./category.interface";

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}
