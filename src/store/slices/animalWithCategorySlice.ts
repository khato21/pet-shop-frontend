import { createSlice } from "@reduxjs/toolkit";

import type { AnimalWithCategoryState } from "../../interfaces/animal-with-category-state.interface";

import {
  getAnimalWithCategories,
  getAnimalWithCategoryById,
} from "../thunks/animalWithCategoryThunks";

const initialState: AnimalWithCategoryState = {
  animalWithCategories: [],
  loading: false,
  error: null,
};

const animalWithCategorySlice = createSlice({
  name: "animalWithCategories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(getAnimalWithCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAnimalWithCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.animalWithCategories = action.payload;
      })
      .addCase(getAnimalWithCategories.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "Failed to get animals with categories";
      })

      .addCase(getAnimalWithCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAnimalWithCategoryById.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.animalWithCategories.findIndex(
          (item) => item.id === action.payload.id,
        );

        if (index !== -1) {
          state.animalWithCategories[index] = action.payload;
        } else {
          state.animalWithCategories.push(action.payload);
        }
      })
      .addCase(getAnimalWithCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message ?? "Failed to get animal with category";
      });
  },
});

export default animalWithCategorySlice.reducer;
