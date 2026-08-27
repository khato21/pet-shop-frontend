import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import AnimalCard from "../../components/AnimalCard/AnimalCard";
import PopularAnimals from "../../components/PopularAnimals/PopularAnimals";

import { getAnimals, getAnimalById } from "../../store/thunks/animalThunks";
import { getCategories } from "../../store/thunks/categoryThunks";
import { getAnimalWithCategories } from "../../store/thunks/animalWithCategoryThunks";

import { updateCartAnimal } from "../../store/slices/cartSlice";

import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { useWebSocket } from "../../hooks/useWebSocket";

import type { WebSocketMessage } from "../../interfaces/websocket.interface";

import styles from "./AnimalsPage.module.css";

const AnimalsPage = () => {
  const dispatch = useAppDispatch();

  const [showBackToTop, setShowBackToTop] = useState(false);

  const {
    animals,
    loading: animalsLoading,
    error: animalsError,
  } = useAppSelector((state) => state.animals);

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useAppSelector((state) => state.categories);

  const {
    animalWithCategories,
    loading: relationsLoading,
    error: relationsError,
  } = useAppSelector((state) => state.animalWithCategories);

  const cart = useAppSelector((state) => state.cart.cart);

  const wishlist = useAppSelector((state) => state.wishlist.wishlist);

  useEffect(() => {
    dispatch(getAnimals());
    dispatch(getCategories());
    dispatch(getAnimalWithCategories());
  }, [dispatch]);

  const handleWebSocketConnected = useCallback(() => {
    console.log("SHOP WebSocket connected");
  }, []);

  const handleWebSocketMessage = useCallback(
    async (message: WebSocketMessage) => {
      // CREATE / DELETE
      // Admin-ში ცხოველის შექმნის ან წაშლის შემდეგ
      // Shop თავიდან იღებს ცხოველების სიას.
      if (
        message.type === "RESOURCE_CHANGED" &&
        message.resource === "animals" &&
        (message.action === "CREATE" || message.action === "DELETE")
      ) {
        console.log(`Animals ${message.action.toLowerCase()}d via WebSocket`);

        dispatch(getAnimals(true));
        dispatch(getAnimalWithCategories(true));

        return;
      }

      // UPDATE
      // კონკრეტული ცხოველის ცვლილებისას
      // მხოლოდ ის ცხოველი წამოვიღოთ თავიდან.
      if (
        message.type === "RESOURCE_CHANGED" &&
        message.resource === "animals" &&
        message.action === "UPDATE" &&
        message.id
      ) {
        console.log("Animal changed via WebSocket:", message.id);

        const oldAnimal = animals.find((animal) => animal.id === message.id);

        const isInCart = cart.some((item) => item.animal.id === message.id);

        const isInWishlist = wishlist.some(
          (item) => item.animal.id === message.id,
        );

        const updatedAnimal = await dispatch(
          getAnimalById(message.id),
        ).unwrap();

        dispatch(updateCartAnimal(updatedAnimal));

        const stockChanged =
          oldAnimal && oldAnimal.stock !== updatedAnimal.stock;

        if (stockChanged && (isInCart || isInWishlist)) {
          if (oldAnimal.stock === 0 && updatedAnimal.stock > 0) {
            toast.success(`${updatedAnimal.name} is back in stock!`);
          } else if (updatedAnimal.stock > oldAnimal.stock) {
            toast.info(
              `${updatedAnimal.name} stock increased to ${updatedAnimal.stock}`,
            );
          } else {
            toast.info(
              `${updatedAnimal.name} stock updated to ${updatedAnimal.stock}`,
            );
          }
        }

        return;
      }

      if (
        message.type === "RESOURCE_CHANGED" &&
        message.resource === "animals_with_categories" &&
        (message.action === "CREATE" || message.action === "DELETE")
      ) {
        console.log(
          `Animal category relation ${message.action.toLowerCase()}d via WebSocket`,
        );

        dispatch(getAnimalWithCategories(true));

        return;
      }
    },
    [animals, cart, wishlist, dispatch],
  );

  useWebSocket(handleWebSocketMessage, handleWebSocketConnected);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const loading = animalsLoading || categoriesLoading || relationsLoading;

  const error = animalsError || categoriesError || relationsError;

  if (loading && animals.length === 0) {
    return <p>Loading animals...</p>;
  }

  if (error && animals.length === 0) {
    return <p>{error}</p>;
  }

  const sortedAnimals = [...animals].sort(
    (a, b) =>
      new Date(b.createdAt ?? 0).getTime() -
      new Date(a.createdAt ?? 0).getTime(),
  );

  return (
    <main className={styles.page}>
      {/* PopularAnimals-ს არ ვეხებით */}
      <PopularAnimals />

      <section className={styles.animalsSection}>
        <h1 className={styles.title}>Animals</h1>

        <div className={styles.list}>
          {sortedAnimals.map((animal) => {
            const relatedCategoryIds = animalWithCategories
              .filter((relation) => relation.animal_id === animal.id)
              .map((relation) => relation.category_id);

            const animalCategories = categories.filter((category) =>
              relatedCategoryIds.includes(category.id),
            );

            return (
              <AnimalCard
                key={animal.id}
                animal={animal}
                categories={animalCategories}
              />
            );
          })}
        </div>
      </section>

      {showBackToTop && (
        <button
          type="button"
          className={styles.backToTop}
          onClick={handleBackToTop}
          aria-label="Back to top"
        >
          <svg
            className={styles.backToTopIcon}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M6 14l6-6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </main>
  );
};

export default AnimalsPage;
