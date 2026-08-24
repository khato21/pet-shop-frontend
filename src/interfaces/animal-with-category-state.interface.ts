import type { AnimalWithCategory } from "./animal-with-category.interface";

export interface AnimalWithCategoryState {
  animalWithCategories: AnimalWithCategory[];
  loading: boolean;
  error: string | null;
}
