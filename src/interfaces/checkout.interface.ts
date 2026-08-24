import type { CartItem } from "./cart.interface";

export interface Checkout {
  items: CartItem[];
  totalPrice: number;
}
