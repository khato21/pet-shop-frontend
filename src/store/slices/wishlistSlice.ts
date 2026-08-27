import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Animal } from "../../interfaces/animal.interface";
import type { WishlistItem } from "../../interfaces/wishlist.interface";
import type { WishlistState } from "../../interfaces/wishlist-state.interface";

import { getWishlistFromStorage } from "../../utils/wishlistStorage";

import {
  getAnimals,
  getAnimalById,
  updateAnimal,
} from "../thunks/animalThunks";

const initialState: WishlistState = {
  wishlist: getWishlistFromStorage(),
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,

  reducers: {
    addToWishlist: (state, action: PayloadAction<Animal>) => {
      const existingItem = state.wishlist.find(
        (item) => item.animal.id === action.payload.id,
      );

      if (!existingItem) {
        const newItem: WishlistItem = {
          animal: action.payload,
        };

        state.wishlist.push(newItem);
      }
    },

    // UPDATE ANIMAL IN WISHLIST
    updateWishlistAnimal: (state, action: PayloadAction<Animal>) => {
      const existingItem = state.wishlist.find(
        (item) => item.animal.id === action.payload.id,
      );

      if (existingItem) {
        existingItem.animal = action.payload;
      }
    },

    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.wishlist = state.wishlist.filter(
        (item) => item.animal.id !== action.payload,
      );
    },

    clearWishlist: (state) => {
      state.wishlist = [];
    },
  },

  extraReducers: (builder) => {
    builder

      .addCase(getAnimals.fulfilled, (state, action) => {
        const freshAnimals = action.payload;

        state.wishlist = state.wishlist.map((item) => {
          const freshAnimal = freshAnimals.find(
            (animal) => animal.id === item.animal.id,
          );

          if (!freshAnimal) {
            return item;
          }

          return {
            ...item,
            animal: freshAnimal,
          };
        });
      })

      .addCase(getAnimalById.fulfilled, (state, action) => {
        const freshAnimal = action.payload;

        const existingItem = state.wishlist.find(
          (item) => item.animal.id === freshAnimal.id,
        );

        if (existingItem) {
          existingItem.animal = freshAnimal;
        }
      })

      .addCase(updateAnimal.fulfilled, (state, action) => {
        const updatedAnimal = action.payload;

        const existingItem = state.wishlist.find(
          (item) => item.animal.id === updatedAnimal.id,
        );

        if (existingItem) {
          existingItem.animal = updatedAnimal;
        }
      });
  },
});

export const {
  addToWishlist,
  updateWishlistAnimal,
  removeFromWishlist,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
