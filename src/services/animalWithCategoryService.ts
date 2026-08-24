import type { AnimalWithCategory } from "../interfaces/animal-with-category.interface";

import { get, getById } from "./apiClient";

const ANIMALS_WITH_CATEGORIES_URL = "animals_with_categories";

interface AnimalWithCategoryApiResponse {
  id: string;
  resource: string;
  data: {
    animal_id: string;
    category_id: string;
  };
  createdAt: string;
  updatedAt: string;
}

const mapAnimalWithCategory = (
  relation: AnimalWithCategoryApiResponse,
): AnimalWithCategory => ({
  id: relation.id,
  animal_id: relation.data.animal_id,
  category_id: relation.data.category_id,
});

export const getAnimalWithCategories = async (): Promise<
  AnimalWithCategory[]
> => {
  const response = await get<AnimalWithCategoryApiResponse[]>(
    ANIMALS_WITH_CATEGORIES_URL,
  );

  return response.map(mapAnimalWithCategory);
};

export const getAnimalWithCategoryById = async (
  id: string,
): Promise<AnimalWithCategory> => {
  const response = await getById<AnimalWithCategoryApiResponse>(
    ANIMALS_WITH_CATEGORIES_URL,
    id,
  );

  return mapAnimalWithCategory(response);
};
