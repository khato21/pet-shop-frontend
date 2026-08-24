import { useCallback, useEffect } from "react";

import CategoryCard from "../../components/CategoryCard/CategoryCard";

import { getCategories } from "../../store/thunks/categoryThunks";

import { useAppDispatch, useAppSelector } from "../../hooks/hooks";

import { useWebSocket } from "../../hooks/useWebSocket";

import type { WebSocketMessage } from "../../interfaces/websocket.interface";

import styles from "./CategoriesPage.module.css";

const CATEGORY_ORDER = [
  "Dogs",
  "Fish",
  "Birds",
  "Reptiles",
  "Small Pets",
  "Cats",
  "Exotic Pets",
  "Wildlife",
];

const CategoriesPage = () => {
  const dispatch = useAppDispatch();

  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useAppSelector((state) => state.categories);

  const loadCategories = useCallback(
    (forceRefresh = false) => {
      dispatch(getCategories(forceRefresh));
    },
    [dispatch],
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleWebSocketConnected = useCallback(() => {
    console.log("SHOP WebSocket connected - synchronizing categories");

    loadCategories(true);
  }, [loadCategories]);

  const handleWebSocketMessage = useCallback(
    (message: WebSocketMessage) => {
      console.log("SHOP received WebSocket event:", message);

      if (
        message.type === "RESOURCE_CHANGED" &&
        message.resource === "categories"
      ) {
        console.log("SHOP: categories changed, reloading...");

        loadCategories(true);
      }
    },
    [loadCategories],
  );

  useWebSocket(handleWebSocketMessage, handleWebSocketConnected);

  const sortedCategories = [...categories].sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a.title);
    const bIndex = CATEGORY_ORDER.indexOf(b.title);

    const aOrder = aIndex === -1 ? CATEGORY_ORDER.length : aIndex;

    const bOrder = bIndex === -1 ? CATEGORY_ORDER.length : bIndex;

    return aOrder - bOrder;
  });

  if (categoriesLoading && categories.length === 0) {
    return (
      <main className={styles.page}>
        <p className={styles.message}>Loading categories...</p>
      </main>
    );
  }

  if (categoriesError) {
    return (
      <main className={styles.page}>
        <p className={styles.error}>{categoriesError}</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Categories</h1>

      {categories.length === 0 ? (
        <p className={styles.message}>No categories found.</p>
      ) : (
        <section className={styles.grid}>
          {sortedCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </section>
      )}
    </main>
  );
};

export default CategoriesPage;
