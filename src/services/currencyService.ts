import type {
  CurrencyApiResponse,
  CurrencyConversion,
} from "../interfaces/currency.interface";

export const convertCurrency = async (
  fromCurrency: "USD" | "GEL",
  toCurrency: "USD" | "GEL",
  amount: number,
): Promise<CurrencyConversion> => {
  const url = `/currency/currencies/convert/${fromCurrency}/${toCurrency}?amountFrom=${amount}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Currency conversion ${fromCurrency} to ${toCurrency} failed`,
    );
  }

  const data: CurrencyApiResponse = await response.json();

  return {
    amount: Number(data.data.amount),
    rate: Number(data.data.rate),
  };
};
