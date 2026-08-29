import { createSlice } from "@reduxjs/toolkit";

import type { AnimalState } from "../../interfaces/animal-state.interface";

import {
  getAnimals,
  getAnimalById,
  updateAnimal,
} from "../thunks/animalThunks";

const initialState: AnimalState = {
  animals: [],
  loading: false,
  error: null,
};

const animalSlice = createSlice({
  name: "animals",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAnimals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAnimals.fulfilled, (state, action) => {
        state.loading = false;
        state.animals = action.payload;
      })
      .addCase(getAnimals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to get animals";
      })
      .addCase(getAnimalById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAnimalById.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.animals.findIndex(
          (animal) => animal.id === action.payload.id,
        );

        if (index !== -1) {
          state.animals[index] = action.payload;
        } else {
          state.animals.push(action.payload);
        }
      })
      .addCase(getAnimalById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to get animal";
      })
      .addCase(updateAnimal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAnimal.fulfilled, (state, action) => {
        state.loading = false;

        const index = state.animals.findIndex(
          (animal) => animal.id === action.payload.id,
        );

        if (index !== -1) {
          state.animals[index] = action.payload;
        }
      })
      .addCase(updateAnimal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to update animal";
      });
  },
});

export default animalSlice.reducer;
