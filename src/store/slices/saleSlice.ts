import { createSlice } from "@reduxjs/toolkit";

import type { SaleState } from "../../interfaces/sale-state.interface";

import { createSale, getSales } from "../thunks/saleThunks";

const initialState: SaleState = {
  sales: [],
  loading: false,
  error: null,
};

const saleSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET SALES
      .addCase(getSales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSales.fulfilled, (state, action) => {
        state.loading = false;
        state.sales = action.payload;
      })
      .addCase(getSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to get sales";
      })

      // CREATE SALE
      .addCase(createSale.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.sales.push(action.payload);
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to create sale";
      });
  },
});

export default saleSlice.reducer;
