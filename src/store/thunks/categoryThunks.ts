import { createAsyncThunk } from "@reduxjs/toolkit";

import type { Category } from "../../interfaces/category.interface";

import {
  getCategories as fetchCategories,
  getCategoryById as fetchCategoryById,
} from "../../services/categoryService";

import type { RootState } from "../index";

export const getCategories = createAsyncThunk<
  Category[],
  boolean | undefined,
  {
    state: RootState;
  }
>(
  "categories/getCategories",
  async () => {
    return await fetchCategories();
  },
  {
    condition: (forceRefresh = false, { getState }) => {
      const { categories } = getState();

      if (!forceRefresh && categories.loading) {
        return false;
      }

      if (!forceRefresh && categories.categories.length > 0) {
        return false;
      }

      return true;
    },
  },
);

export const getCategoryById = createAsyncThunk<Category, string>(
  "categories/getCategoryById",
  async (id) => {
    return await fetchCategoryById(id);
  },
);
