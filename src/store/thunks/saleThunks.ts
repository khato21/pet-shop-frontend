import { createAsyncThunk } from "@reduxjs/toolkit";
import type { Sale, SaleApiResponse } from "../../interfaces/sale.interface";
import { create, get } from "../../services/apiClient";
import type { RootState } from "../index";

const SALES_URL = "sales";
const WEBSOCKET_URL = "ws://localhost:3001";

export const createSale = createAsyncThunk<Sale, Sale>(
  "sales/createSale",
  async (saleData) => {
    const response = await create<SaleApiResponse[], any>(SALES_URL, {
      resource: "sales",
      data: {
        animalId: saleData.animalId,
        quantity: saleData.quantity,
      },
    });

    const createdRecord = response[0];
    const createdSale: Sale = {
      animalId: createdRecord?.data?.animalId || saleData.animalId,
      quantity: createdRecord?.data?.quantity || saleData.quantity,
    };

    try {
      const socket = new WebSocket(WEBSOCKET_URL);
      socket.onopen = () => {
        socket.send(
          JSON.stringify({
            type: "RESOURCE_CHANGED",
            resource: "sales",
            action: "CREATE",
            data: {
              animalId: createdSale.animalId,
              quantity: createdSale.quantity,
            },
          }),
        );
        setTimeout(() => socket.close(), 100);
      };
    } catch (err) {
      console.error("WS Error:", err);
    }

    return createdSale;
  },
);

export const getSales = createAsyncThunk<
  Sale[],
  boolean | undefined,
  { state: RootState }
>(
  "sales/getSales",
  async () => {
    const response = await get<SaleApiResponse[]>(SALES_URL);
    if (!Array.isArray(response)) return [];

    return response
      .filter((item) => item && item.data)
      .map((sale) => ({
        animalId: sale.data.animalId,
        quantity: sale.data.quantity,
      }));
  },
  {
    condition: (forceRefresh = false, { getState }) => {
      const { sales } = getState();
      if (sales.loading) return false;
      if (forceRefresh) return true;
      if (sales.sales.length > 0) return false; // 💡 თუ მონაცემები უკვე Redux-შია, აღარ გააგზავნოს
      return true;
    },
  },
);
