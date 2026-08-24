import { configureStore } from "@reduxjs/toolkit";

import animalReducer from "./slices/animalSlice";
import categoryReducer from "./slices/categorySlice";
import animalWithCategoryReducer from "./slices/animalWithCategorySlice";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import currencyReducer from "./slices/currencySlice";
import saleReducer from "./slices/saleSlice";

import { saveWishlistToStorage } from "../utils/wishlistStorage";

export const store = configureStore({
  reducer: {
    animals: animalReducer,
    categories: categoryReducer,
    animalWithCategories: animalWithCategoryReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    currency: currencyReducer,
    sales: saleReducer,
  },
});

store.subscribe(() => {
  const wishlist = store.getState().wishlist.wishlist;

  saveWishlistToStorage(wishlist);
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
