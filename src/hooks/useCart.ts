import { useAppDispatch, useAppSelector } from "./hooks";

import {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} from "../store/slices/cartSlice";

import type { Animal } from "../interfaces/animal.interface";

import { toast } from "react-toastify";

const useCart = () => {
  const dispatch = useAppDispatch();

  const cart = useAppSelector((state) => state.cart.cart);

  const addAnimal = (animal: Animal) => {
    if (animal.stock <= 0) {
      toast.error("Cannot add this animal — out of stock");
      return false;
    }

    const existingItem = cart.find((item) => item.animal.id === animal.id);

    if (existingItem && existingItem.quantity >= animal.stock) {
      toast.error("Cannot add more — maximum stock reached");
      return false;
    }

    dispatch(addToCart(animal));

    toast.success(`${animal.name} added to cart`);

    return true;
  };

  const addAllAnimals = (animals: Animal[]) => {
    let addedCount = 0;

    animals.forEach((animal) => {
      if (animal.stock <= 0) {
        return;
      }

      const existingItem = cart.find((item) => item.animal.id === animal.id);

      if (existingItem && existingItem.quantity >= animal.stock) {
        return;
      }

      dispatch(addToCart(animal));
      addedCount++;
    });

    if (addedCount === animals.length) {
      toast.success("All wishlist items added to cart");
    } else if (addedCount > 0) {
      toast.success(`${addedCount} wishlist items added to cart`);
    } else {
      toast.error("No wishlist items could be added to cart");
    }
  };

  const increaseAnimalQuantity = (animalId: string) => {
    const item = cart.find((cartItem) => cartItem.animal.id === animalId);

    if (!item) {
      toast.error("Animal not found in cart");
      return;
    }

    if (item.quantity >= item.animal.stock) {
      toast.error("Cannot increase quantity — maximum stock reached");
      return;
    }

    dispatch(increaseQuantity(animalId));
  };

  const decreaseAnimalQuantity = (animalId: string) => {
    const item = cart.find((cartItem) => cartItem.animal.id === animalId);

    if (!item) {
      toast.error("Animal not found in cart");
      return;
    }

    if (item.quantity <= 1) {
      return;
    }

    dispatch(decreaseQuantity(animalId));
  };

  const removeAnimal = (animalId: string) => {
    const item = cart.find((cartItem) => cartItem.animal.id === animalId);

    if (!item) {
      toast.error("Animal not found in cart");
      return;
    }

    dispatch(removeFromCart(animalId));

    toast.success(`${item.animal.name} removed from cart`);
  };

  const removeAllAnimals = () => {
    if (cart.length === 0) {
      toast.error("Cart is already empty");
      return;
    }

    dispatch(clearCart());

    toast.success("Cart cleared");
  };

  return {
    cart,
    addAnimal,
    addAllAnimals,
    increaseAnimalQuantity,
    decreaseAnimalQuantity,
    removeAnimal,
    removeAllAnimals,
  };
};

export default useCart;
