export type Currency = "GEL" | "USD";

export interface CurrencyApiResponse {
  data: {
    amount: number;
    rate: number;
  };
}

export interface CurrencyConversion {
  amount: number;
  rate: number;
}
