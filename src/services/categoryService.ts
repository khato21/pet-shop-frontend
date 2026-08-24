import type {
  Category,
  CategoryApiResponse,
} from "../interfaces/category.interface";

import { get, getById } from "./apiClient";

const CATEGORIES_URL = "categories";

const mapCategory = (category: CategoryApiResponse): Category => ({
  id: category.id,
  title: category.data.title,
  description: category.data.description,
});

export const getCategories = async (): Promise<Category[]> => {
  const response = await get<CategoryApiResponse[]>(CATEGORIES_URL);

  return response.map(mapCategory);
};

export const getCategoryById = async (id: string): Promise<Category> => {
  const response = await getById<CategoryApiResponse>(CATEGORIES_URL, id);

  return mapCategory(response);
};
