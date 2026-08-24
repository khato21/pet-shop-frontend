import type { Sale } from "./sale.interface";

export interface SaleState {
  sales: Sale[];
  loading: boolean;
  error: string | null;
}
