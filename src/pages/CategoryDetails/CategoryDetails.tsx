import { useCallback, useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import AnimalCard from "../../components/AnimalCard/AnimalCard";

import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { useWebSocket } from "../../hooks/useWebSocket";

import type { WebSocketMessage } from "../../interfaces/websocket.interface";

import { getAnimals } from "../../store/thunks/animalThunks";
import { getCategories } from "../../store/thunks/categoryThunks";
import { getAnimalWithCategories } from "../../store/thunks/animalWithCategoryThunks";

import styles from "./CategoryDetails.module.css";

const CategoryDetails = () => {
  const { id } = useParams<{ id: string }>();

  const dispatch = useAppDispatch();

  const [showScrollTop, setShowScrollTop] = useState(false);

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useAppSelector((state) => state.categories);

  const {
    animals,
    loading: animalsLoading,
    error: animalsError,
  } = useAppSelector((state) => state.animals);

  const {
    animalWithCategories,
    loading: relationsLoading,
    error: relationsError,
  } = useAppSelector((state) => state.animalWithCategories);

  const loadCategoryData = useCallback(
    (forceRefresh = false) => {
      dispatch(getCategories(forceRefresh));
      dispatch(getAnimals(forceRefresh));
      dispatch(getAnimalWithCategories(forceRefresh));
    },
    [dispatch],
  );

  useEffect(() => {
    loadCategoryData();
  }, [loadCategoryData]);

  const handleWebSocketConnected = useCallback(() => {
    console.log("SHOP WebSocket connected - synchronizing category details");

    loadCategoryData(true);
  }, [loadCategoryData]);

  const handleWebSocketMessage = useCallback(
    (message: WebSocketMessage) => {
      console.log("SHOP received WebSocket event:", message);

      if (message.type !== "RESOURCE_CHANGED") {
        return;
      }

      /*
       * ADMIN-ში ცხოველის შექმნა ან წაშლა
       * → Shop თავიდან იღებს animals-ს და relations-ს.
       */
      if (
        message.resource === "animals" &&
        (message.action === "CREATE" || message.action === "DELETE")
      ) {
        console.log(
          `SHOP: animal ${message.action.toLowerCase()} detected, reloading...`,
        );

        dispatch(getAnimals(true));
        dispatch(getAnimalWithCategories(true));

        return;
      }

      /*
       * ADMIN-ში ცხოველის UPDATE
       * → Shop თავიდან იღებს animals-საც და relations-საც,
       * რათა ცვლილება აუცილებლად აისახოს მიმდინარე გვერდზე.
       */
      if (message.resource === "animals" && message.action === "UPDATE") {
        console.log(
          "SHOP: animal updated, synchronizing animals and relations...",
        );

        dispatch(getAnimals(true));
        dispatch(getAnimalWithCategories(true));

        return;
      }

      if (
        message.resource === "categories" &&
        (message.action === "CREATE" ||
          message.action === "UPDATE" ||
          message.action === "DELETE")
      ) {
        console.log(
          `SHOP: category ${message.action.toLowerCase()} detected, reloading categories...`,
        );

        dispatch(getCategories(true));

        return;
      }

      if (
        message.resource === "animals_with_categories" &&
        (message.action === "CREATE" || message.action === "DELETE")
      ) {
        console.log(
          `SHOP: animal/category relation ${message.action.toLowerCase()} detected, reloading relations...`,
        );

        dispatch(getAnimalWithCategories(true));

        return;
      }

      if (
        message.resource === "animals_with_categories" &&
        message.action === "UPDATE"
      ) {
        console.log(
          "SHOP: animal/category relation updated, reloading relations...",
        );

        dispatch(getAnimalWithCategories(true));
      }
    },
    [dispatch],
  );

  useWebSocket(handleWebSocketMessage, handleWebSocketConnected);

  useEffect(() => {
    const handleWindowFocus = () => {
      loadCategoryData();
    };

    window.addEventListener("focus", handleWindowFocus);

    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [loadCategoryData]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const category = categories.find((item) => item.id === id);

  const loading = categoriesLoading || animalsLoading || relationsLoading;

  const error = categoriesError || animalsError || relationsError;

  if (loading) {
    return (
      <main className={styles.page}>
        <p className={styles.message}>Loading category...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <p className={styles.error}>{error}</p>
      </main>
    );
  }

  if (!category) {
    return (
      <main className={styles.page}>
        <p className={styles.message}>Category not found.</p>
      </main>
    );
  }

  const categoryAnimalIds = animalWithCategories
    .filter((relation) => relation.category_id === category.id)
    .map((relation) => relation.animal_id);

  const categoryAnimals = animals
    .filter((animal) => categoryAnimalIds.includes(animal.id))
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime(),
    );

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <h1 className={styles.title}>{category.title}</h1>

        <p className={styles.description}>{category.description}</p>

        <Link to="/categories" className={styles.backLink}>
          ← Back to Categories
        </Link>
      </section>

      {categoryAnimals.length === 0 ? (
        <p className={styles.message}>No animals found in this category.</p>
      ) : (
        <section className={styles.list}>
          {categoryAnimals.map((animal) => {
            const relatedCategoryIds = animalWithCategories
              .filter((relation) => relation.animal_id === animal.id)
              .map((relation) => relation.category_id);

            const animalCategories = categories.filter((item) =>
              relatedCategoryIds.includes(item.id),
            );

            return (
              <AnimalCard
                key={animal.id}
                animal={animal}
                categories={animalCategories}
              />
            );
          })}
        </section>
      )}

      {showScrollTop && (
        <button
          type="button"
          className={styles.scrollTopButton}
          onClick={handleScrollTop}
          aria-label="Scroll to top"
        >
          <svg
            className={styles.scrollTopIcon}
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

export default CategoryDetails;
