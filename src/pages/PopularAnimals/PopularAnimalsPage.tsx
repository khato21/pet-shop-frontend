import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AnimalCard from "../../components/AnimalCard/AnimalCard";

import { getAnimals, getAnimalById } from "../../store/thunks/animalThunks";
import { getCategories } from "../../store/thunks/categoryThunks";
import { getAnimalWithCategories } from "../../store/thunks/animalWithCategoryThunks";

import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { useWebSocket } from "../../hooks/useWebSocket";

import type { WebSocketMessage } from "../../interfaces/websocket.interface";

import styles from "../../pages/PopularAnimals/PopularAnimalsPage.module.css";

const PopularAnimalsPage = () => {
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    dispatch(getAnimals());
    dispatch(getCategories());
    dispatch(getAnimalWithCategories());
  }, [dispatch]);

  const handleWebSocketMessage = useCallback(
    async (message: WebSocketMessage) => {
      if (
        message.type === "RESOURCE_CHANGED" &&
        message.resource === "animals" &&
        (message.action === "CREATE" || message.action === "DELETE")
      ) {
        dispatch(getAnimals());
        dispatch(getAnimalWithCategories());

        return;
      }

      if (
        message.type === "RESOURCE_CHANGED" &&
        message.resource === "animals" &&
        message.action === "UPDATE" &&
        message.id
      ) {
        dispatch(getAnimalById(message.id));

        return;
      }

      if (
        message.type === "RESOURCE_CHANGED" &&
        message.resource === "animals_with_categories" &&
        (message.action === "CREATE" || message.action === "DELETE")
      ) {
        dispatch(getAnimalWithCategories());

        return;
      }
    },
    [dispatch],
  );

  useWebSocket(handleWebSocketMessage);

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

  const popularAnimals = animals.filter((animal) => animal.isPopular);

  if (loading && animals.length === 0) {
    return <p>Loading popular animals...</p>;
  }

  if (error && popularAnimals.length === 0) {
    return <p>{error}</p>;
  }

  return (
    <main className={styles.page}>
      <section className={styles.animalsSection}>
        <h1 className={styles.title}>Popular Animals</h1>

        <Link to="/" className={styles.backButton}>
          ← Back to Home
        </Link>

        <div className={styles.list}>
          {popularAnimals.map((animal) => {
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

export default PopularAnimalsPage;
