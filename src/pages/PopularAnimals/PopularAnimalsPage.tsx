import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AnimalCard from "../../components/AnimalCard/AnimalCard";

import { getAnimals, getAnimalById } from "../../store/thunks/animalThunks";
import { getCategories } from "../../store/thunks/categoryThunks";
import { getAnimalWithCategories } from "../../store/thunks/animalWithCategoryThunks";

import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { useWebSocket } from "../../hooks/useWebSocket";

import { selectAnimalsWithCategories } from "../../store/selectors/animalSelectors";

import type { WebSocketMessage } from "../../interfaces/websocket.interface";

import styles from "./PopularAnimalsPage.module.css";

const PopularAnimalsPage = () => {
  const dispatch = useAppDispatch();

  const [showBackToTop, setShowBackToTop] = useState(false);

  const { loading: animalsLoading, error: animalsError } = useAppSelector(
    (state) => state.animals,
  );

  const { loading: categoriesLoading, error: categoriesError } = useAppSelector(
    (state) => state.categories,
  );

  const { loading: relationsLoading, error: relationsError } = useAppSelector(
    (state) => state.animalWithCategories,
  );

  const animalsWithCategories = useAppSelector(selectAnimalsWithCategories);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    dispatch(getAnimals());
    dispatch(getCategories());
    dispatch(getAnimalWithCategories());
  }, [dispatch]);

  const handleWebSocketConnected = useCallback(() => {
    console.log("SHOP WebSocket connected - synchronizing popular animals");

    dispatch(getAnimals(true));
    dispatch(getAnimalWithCategories(true));
  }, [dispatch]);

  const handleWebSocketMessage = useCallback(
    (message: WebSocketMessage) => {
      if (
        message.type === "RESOURCE_CHANGED" &&
        message.resource === "animals" &&
        (message.action === "CREATE" || message.action === "DELETE")
      ) {
        dispatch(getAnimals(true));
        dispatch(getAnimalWithCategories(true));

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
        dispatch(getAnimalWithCategories(true));
      }
    },
    [dispatch],
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

  const popularAnimals = animalsWithCategories
    .filter((item) => item.animal.isPopular)
    .reverse();

  if (loading && animalsWithCategories.length === 0) {
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
          {popularAnimals.map(({ animal, categories }) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              categories={categories}
            />
          ))}
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
