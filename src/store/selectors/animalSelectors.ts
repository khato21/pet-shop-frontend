import type { RootState } from "../index";

export const selectAnimalsWithCategories = (state: RootState) => {
  const { animals } = state.animals;
  const { categories } = state.categories;
  const { animalWithCategories } = state.animalWithCategories;

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
};
