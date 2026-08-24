import type { Checkout } from "./checkout.interface";

export interface CheckoutState {
  checkout: Checkout | null;
  loading: boolean;
  error: string | null;
}
