import type { WishlistItem } from "../interfaces/wishlist.interface";

const WISHLIST_STORAGE_KEY = "wishlist";

export const getWishlistFromStorage = (): WishlistItem[] => {
  const savedWishlist = localStorage.getItem(WISHLIST_STORAGE_KEY);

  if (!savedWishlist) {
    return [];
  }

  try {
    return JSON.parse(savedWishlist) as WishlistItem[];
  } catch {
    return [];
  }
};

export const saveWishlistToStorage = (wishlist: WishlistItem[]): void => {
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
};
