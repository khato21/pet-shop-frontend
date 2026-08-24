import { useAppDispatch, useAppSelector } from "./hooks";

import {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../store/slices/wishlistSlice";

import type { Animal } from "../interfaces/animal.interface";

import { toast } from "react-toastify";

const useWishlist = () => {
  const dispatch = useAppDispatch();

  const wishlist = useAppSelector((state) => state.wishlist.wishlist);

  const addAnimal = (animal: Animal) => {
    const existingItem = wishlist.find((item) => item.animal.id === animal.id);

    if (existingItem) {
      toast.info(`${animal.name} is already in wishlist`);
      return;
    }

    dispatch(addToWishlist(animal));

    toast.success(`${animal.name} added to wishlist`);
  };

  const removeAnimal = (animalId: string) => {
    const item = wishlist.find(
      (wishlistItem) => wishlistItem.animal.id === animalId,
    );

    if (!item) {
      toast.error("Animal not found in wishlist");
      return;
    }

    dispatch(removeFromWishlist(animalId));

    toast.success(`${item.animal.name} removed from wishlist`);
  };

  const removeAllAnimals = () => {
    if (wishlist.length === 0) {
      toast.error("Wishlist is already empty");
      return;
    }

    dispatch(clearWishlist());

    toast.success("Wishlist cleared");
  };

  const isInWishlist = (animalId: string) => {
    return wishlist.some((item) => item.animal.id === animalId);
  };

  return {
    wishlist,
    addAnimal,
    removeAnimal,
    removeAllAnimals,
    isInWishlist,
  };
};

export default useWishlist;
