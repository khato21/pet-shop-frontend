import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { CartItem } from "../../interfaces/cart.interface";
import type { CartState } from "../../interfaces/cart-state.interface";
import type { Animal } from "../../interfaces/animal.interface";

const initialState: CartState = {
  cart: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    // ADD ANIMAL TO CART
    addToCart: (state, action: PayloadAction<Animal>) => {
      if (action.payload.stock <= 0) {
        return;
      }

      const existingItem = state.cart.find(
        (item) => item.animal.id === action.payload.id,
      );

      if (existingItem) {
        if (existingItem.quantity < action.payload.stock) {
          existingItem.quantity += 1;
        }
      } else {
        const newItem: CartItem = {
          animal: action.payload,
          quantity: 1,
        };

        state.cart.push(newItem);
      }
    },

    // INCREASE QUANTITY
    increaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.cart.find(
        (cartItem) => cartItem.animal.id === action.payload,
      );

      if (!item) {
        return;
      }

      if (item.quantity < item.animal.stock) {
        item.quantity += 1;
      }
    },

    // DECREASE QUANTITY
    decreaseQuantity: (state, action: PayloadAction<string>) => {
      const item = state.cart.find(
        (cartItem) => cartItem.animal.id === action.payload,
      );

      if (!item) {
        return;
      }

      if (item.quantity > 1) {
        item.quantity -= 1;
      }
    },

    // REMOVE ANIMAL FROM CART
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter(
        (item) => item.animal.id !== action.payload,
      );
    },

    // UPDATE ANIMAL IN CART
    updateCartAnimal: (state, action: PayloadAction<Animal>) => {
      const existingItem = state.cart.find(
        (item) => item.animal.id === action.payload.id,
      );

      if (existingItem) {
        existingItem.animal = action.payload;
      }
    },

    // CLEAR CART
    clearCart: (state) => {
      state.cart = [];
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  updateCartAnimal,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
