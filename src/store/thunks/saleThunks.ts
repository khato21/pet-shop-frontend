import { createAsyncThunk } from "@reduxjs/toolkit";

import type { Sale, SaleApiResponse } from "../../interfaces/sale.interface";

import { create, get } from "../../services/apiClient";

import type { RootState } from "../index";

const SALES_URL = "sales";

export const createSale = createAsyncThunk<Sale, Sale>(
  "sales/createSale",
  async (sale) => {
    const response = await create<SaleApiResponse[], Sale>(SALES_URL, sale);

    const createdSale = response[0];

    return {
      animalId: createdSale.data.animalId,
      quantity: createdSale.data.quantity,
    };
  },
);

export const getSales = createAsyncThunk<
  Sale[],
  void,
  {
    state: RootState;
  }
>(
  "sales/getSales",
  async () => {
    const response = await get<SaleApiResponse[]>(SALES_URL);

    return response.map((sale) => ({
      animalId: sale.data.animalId,
      quantity: sale.data.quantity,
    }));
  },
  {
    condition: (_, { getState }) => {
      const { sales } = getState();

      if (sales.loading) {
        return false;
      }

      if (sales.sales.length > 0) {
        return false;
      }

      return true;
    },
  },
);
