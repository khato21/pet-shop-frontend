import { createAsyncThunk } from "@reduxjs/toolkit";

import type { AnimalWithCategory } from "../../interfaces/animal-with-category.interface";

import {
  getAnimalWithCategories as fetchAnimalWithCategories,
  getAnimalWithCategoryById as fetchAnimalWithCategoryById,
} from "../../services/animalWithCategoryService";

import type { RootState } from "../index";

export const getAnimalWithCategories = createAsyncThunk<
  AnimalWithCategory[],
  boolean | undefined,
  {
    state: RootState;
  }
>(
  "animalWithCategories/getAnimalWithCategories",
  async () => {
    return await fetchAnimalWithCategories();
  },
  {
    condition: (forceRefresh = false, { getState }) => {
      const { animalWithCategories } = getState();

      if (!forceRefresh && animalWithCategories.loading) {
        return false;
      }

      if (
        !forceRefresh &&
        animalWithCategories.animalWithCategories.length > 0
      ) {
        return false;
      }

      return true;
    },
  },
);

export const getAnimalWithCategoryById = createAsyncThunk<
  AnimalWithCategory,
  string
>("animalWithCategories/getAnimalWithCategoryById", async (id) => {
  return await fetchAnimalWithCategoryById(id);
});
