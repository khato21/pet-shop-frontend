import { createSlice } from "@reduxjs/toolkit";
import type { SaleState } from "../../interfaces/sale-state.interface";
import { getSales, createSale } from "../thunks/saleThunks";

const initialState: SaleState = {
  sales: [],
  loading: false,
  error: null,
};

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      .addCase(createSale.fulfilled, (state, action) => {
        state.sales.push(action.payload);
      });
  },
});

export default salesSlice.reducer;
