import { createSlice } from "@reduxjs/toolkit";

import type { CurrencyState } from "../../interfaces/currency-state.interface";

const initialState: CurrencyState = {
  currency: "GEL",
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    toggleCurrency: (state) => {
      state.currency = state.currency === "GEL" ? "USD" : "GEL";
    },
  },
});

export const { toggleCurrency } = currencySlice.actions;

export default currencySlice.reducer;
