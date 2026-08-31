import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";

import "swiper/css";

import AnimalCard from "../AnimalCard/AnimalCard";

import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { useWebSocket } from "../../hooks/useWebSocket";

import { getAnimals, getAnimalById } from "../../store/thunks/animalThunks";
import { getCategories } from "../../store/thunks/categoryThunks";
import { getAnimalWithCategories } from "../../store/thunks/animalWithCategoryThunks";
import { getSales } from "../../store/thunks/saleThunks";

import type { Animal } from "../../interfaces/animal.interface";
import type { WebSocketMessage } from "../../interfaces/websocket.interface";

import styles from "./PopularAnimals.module.css";

interface PopularAnimalsProps {
  showViewAll?: boolean;
}

interface SaleWebSocketData {
  animalId?: string;
  quantity?: number;
}

const PopularAnimals = ({ showViewAll = false }: PopularAnimalsProps) => {
  const dispatch = useAppDispatch();
  const swiperRef = useRef<SwiperInstance | null>(null);

  const [sliderAnimalIds, setSliderAnimalIds] = useState<string[]>([]);
  const [salesMap, setSalesMap] = useState<Record<string, number>>({});
  const [initialDataReady, setInitialDataReady] = useState(false);

  const {
    animals,
    loading: animalsLoading,
    error: animalsError,
  } = useAppSelector((state) => state.animals);

  const { sales, loading: salesLoading } = useAppSelector(
    (state) => state.sales,
  );

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
    const loadInitialData = async () => {
      await Promise.all([
        dispatch(getAnimals()),
        dispatch(getSales()),
        dispatch(getCategories()),
        dispatch(getAnimalWithCategories()),
      ]);

      setInitialDataReady(true);
    };

    loadInitialData();
  }, [dispatch]);

  useEffect(() => {
    if (!sales) return;

    const map: Record<string, number> = {};

    sales.forEach((s) => {
      if (s.animalId) {
        map[s.animalId] = (map[s.animalId] ?? 0) + (s.quantity || 1);
      }
    });

    setSalesMap(map);
  }, [sales]);

  const handleWebSocketMessage = useCallback(
    async (message: WebSocketMessage) => {
      if (
        message.type === "RESOURCE_CHANGED" &&
        message.resource === "animals" &&
        message.action === "UPDATE" &&
        message.id
      ) {
        try {
          const updatedAnimal = await dispatch(
            getAnimalById(message.id),
          ).unwrap();

          if (!updatedAnimal.isPopular) {
            setSliderAnimalIds((prev) =>
              prev.filter((id) => id !== updatedAnimal.id),
            );
          }
        } catch (error) {
          console.error(
            "Failed to update popular animal via WebSocket:",
            error,
          );
        }

        return;
      }

      if (
        message.type !== "RESOURCE_CHANGED" ||
        message.resource === "sales" ||
        message.action === "CREATE"
      ) {
        return;
      }

      const rawMessage = message as any;

      const saleData: SaleWebSocketData | undefined =
        rawMessage.data ?? rawMessage.payload?.data;

      const animalId = saleData?.animalId;
      const quantity = saleData?.quantity ?? 1;

      if (!animalId) return;

      setSalesMap((prev) => ({
        ...prev,
        [animalId]: (prev[animalId] ?? 0) + quantity,
      }));
    },
    [dispatch],
  );

  useWebSocket(handleWebSocketMessage);

  useEffect(() => {
    if (!initialDataReady || animals.length === 0 || salesLoading) return;

    const popularAnimals = animals.filter((a) => a.isPopular);

    setSliderAnimalIds((currentIds) => {
      if (currentIds.length === 0) {
        const sortedBySales = [...popularAnimals].sort(
          (a, b) => (salesMap[b.id] ?? 0) - (salesMap[a.id] ?? 0),
        );
        return sortedBySales.slice(0, 5).map((a) => a.id);
      }

      const validCurrentIds = currentIds.filter((id) => {
        const animal = animals.find((a) => a.id === id);
        return animal && animal.isPopular;
      });

      const currentSet = new Set(validCurrentIds);
      const outsideAnimals = popularAnimals.filter(
        (a) => !currentSet.has(a.id),
      );

      if (validCurrentIds.length < 5 && outsideAnimals.length > 0) {
        const neededCount = 5 - validCurrentIds.length;
        const animalsToAdd = [...outsideAnimals]
          .sort((a, b) => (salesMap[b.id] ?? 0) - (salesMap[a.id] ?? 0))
          .slice(0, neededCount)
          .map((a) => a.id);

        return [...validCurrentIds, ...animalsToAdd];
      }

      if (validCurrentIds.length === 5 && outsideAnimals.length > 0) {
        let topOutsideAnimal: Animal | null = null;
        let topOutsideSales = -1;

        for (const animal of outsideAnimals) {
          const currentSales = salesMap[animal.id] ?? 0;
          if (currentSales > topOutsideSales) {
            topOutsideSales = currentSales;
            topOutsideAnimal = animal;
          }
        }

        if (!topOutsideAnimal || topOutsideSales <= 0) {
          return validCurrentIds;
        }

        let minIndex = 0;
        let minSales = salesMap[validCurrentIds[0]] ?? 0;

        for (let i = 1; i < validCurrentIds.length; i++) {
          const currentSales = salesMap[validCurrentIds[i]] ?? 0;
          if (currentSales < minSales) {
            minSales = currentSales;
            minIndex = i;
          }
        }

        if (topOutsideSales > minSales) {
          const nextIds = [...validCurrentIds];
          nextIds[minIndex] = topOutsideAnimal.id;
          return nextIds;
        }
      }

      return validCurrentIds;
    });
  }, [initialDataReady, animals, salesMap, salesLoading]);

  const sliderAnimals = sliderAnimalIds
    .map((id) => animals.find((a) => a.id === id))
    .filter((a): a is Animal => Boolean(a));

  useEffect(() => {
    swiperRef.current?.update();
  }, [sliderAnimals]);

  const loading =
    animalsLoading || categoriesLoading || relationsLoading || salesLoading;

  const error = animalsError || categoriesError || relationsError;

  if (loading && animals.length === 0) {
    return <p>Loading popular animals...</p>;
  }

  if (error && sliderAnimals.length === 0) {
    return <p>{error}</p>;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Popular Animals</h2>

        {showViewAll && (
          <Link to="/animals/popular" className={styles.viewAllButton}>
            VIEW ALL
          </Link>
        )}
      </div>

      <div className={styles.sliderWrapper}>
        <button
          type="button"
          className={`${styles.navigationButton} ${styles.prevButton}`}
          onClick={() => swiperRef.current?.slidePrev()}
        >
          ‹
        </button>

        <Swiper
          className={styles.swiper}
          spaceBetween={24}
          slidesPerView={1}
          observer
          observeParents
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          breakpoints={{
            600: { slidesPerView: 2 },
            900: { slidesPerView: 3 },
            1100: { slidesPerView: 4 },
          }}
        >
          {sliderAnimals.map((animal) => {
            const relatedCategoryIds = animalWithCategories
              .filter((relation) => relation.animal_id === animal.id)
              .map((relation) => relation.category_id);

            const animalCategories = categories.filter((category) =>
              relatedCategoryIds.includes(category.id),
            );

            return (
              <SwiperSlide className={styles.slide} key={animal.id}>
                <AnimalCard animal={animal} categories={animalCategories} />
              </SwiperSlide>
            );
          })}
        </Swiper>

        <button
          type="button"
          className={`${styles.navigationButton} ${styles.nextButton}`}
          onClick={() => swiperRef.current?.slideNext()}
        >
          ›
        </button>
      </div>
    </section>
  );
};

export default PopularAnimals;
