import { createSelector } from "@reduxjs/toolkit";

import type { RootState } from "../index";

const selectAnimals = (state: RootState) => state.animals.animals;

const selectCategories = (state: RootState) => state.categories.categories;

const selectAnimalWithCategories = (state: RootState) =>
  state.animalWithCategories.animalWithCategories;

export const selectAnimalsWithCategories = createSelector(
  [selectAnimals, selectCategories, selectAnimalWithCategories],
  (animals, categories, animalWithCategories) => {
    return animals.map((animal) => {
      const relatedCategoryIds = animalWithCategories
        .filter((relation) => relation.animal_id === animal.id)
        .map((relation) => relation.category_id);

      const animalCategories = categories.filter((category) =>
        relatedCategoryIds.includes(category.id),
      );

      return {
        animal,
        categories: animalCategories,
      };
    });
  },
);
