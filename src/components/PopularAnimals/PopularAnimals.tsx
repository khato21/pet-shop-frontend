import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";

import "swiper/css";

import AnimalCard from "../AnimalCard/AnimalCard";

import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { useWebSocket } from "../../hooks/useWebSocket";

import { getAnimals } from "../../store/thunks/animalThunks";
import { getCategories } from "../../store/thunks/categoryThunks";
import { getAnimalWithCategories } from "../../store/thunks/animalWithCategoryThunks";
import { getSales } from "../../store/thunks/saleThunks";

import type { Animal } from "../../interfaces/animal.interface";
import type { Sale } from "../../interfaces/sale.interface";
import type { WebSocketMessage } from "../../interfaces/websocket.interface";

import styles from "./PopularAnimals.module.css";

interface PopularAnimalsProps {
  showViewAll?: boolean;
}

interface SaleWebSocketData {
  animalId?: string;
  quantity?: number;
}

const POPULAR_ANIMALS_STORAGE_KEY = "popularAnimalsSliderIds";

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
      const [, salesData] = await Promise.all([
        dispatch(getAnimals()),
        dispatch(getSales()).unwrap(),
        dispatch(getCategories()),
        dispatch(getAnimalWithCategories()),
      ]);

      const map: Record<string, number> = {};

      (salesData as Sale[]).forEach((sale) => {
        if (sale.animalId) {
          map[sale.animalId] = (map[sale.animalId] ?? 0) + (sale.quantity || 1);
        }
      });

      setSalesMap(map);
      setInitialDataReady(true);
    };

    loadInitialData();
  }, [dispatch]);

  useEffect(() => {
    if (!sales || sales.length === 0) return;

    const map: Record<string, number> = {};

    sales.forEach((sale) => {
      if (sale.animalId) {
        map[sale.animalId] = (map[sale.animalId] ?? 0) + (sale.quantity || 1);
      }
    });

    setSalesMap(map);
  }, [sales]);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    const rawMessage = message as any;

    const resource =
      "resource" in message
        ? message.resource
        : (rawMessage.resource ?? rawMessage.payload?.resource);

    const action =
      "action" in message
        ? message.action
        : (rawMessage.action ?? rawMessage.payload?.action);

    if (resource === "sales" && action === "CREATE") {
      const saleData: SaleWebSocketData | undefined =
        rawMessage.data ?? rawMessage.payload?.data;

      const animalId = saleData?.animalId;
      const quantity = Number(saleData?.quantity) || 1;

      if (!animalId) return;

      setSalesMap((prev) => ({
        ...prev,
        [animalId]: (prev[animalId] ?? 0) + quantity,
      }));
    }
  }, []);

  useWebSocket(handleWebSocketMessage);

  useEffect(() => {
    if (!initialDataReady || animals.length === 0 || salesLoading) return;

    const popularAnimals = animals.filter((animal) => animal.isPopular);

    setSliderAnimalIds((currentIds) => {
      let nextIds = currentIds;

      if (nextIds.length === 0) {
        const savedIds = localStorage.getItem(POPULAR_ANIMALS_STORAGE_KEY);

        if (savedIds) {
          try {
            const parsedIds: unknown = JSON.parse(savedIds);

            if (Array.isArray(parsedIds)) {
              const validSavedIds = parsedIds.filter(
                (id): id is string =>
                  typeof id === "string" &&
                  popularAnimals.some((animal) => animal.id === id),
              );

              if (validSavedIds.length === 5) {
                nextIds = validSavedIds;
              }
            }
          } catch {
            localStorage.removeItem(POPULAR_ANIMALS_STORAGE_KEY);
          }
        }

        if (nextIds.length === 0) {
          nextIds = popularAnimals.slice(0, 5).map((animal) => animal.id);
        }
      }

      const validCurrentIds = nextIds.filter((id) => {
        const animal = animals.find((item) => item.id === id);

        return animal && animal.isPopular;
      });

      const currentSet = new Set(validCurrentIds);

      const outsideAnimals = popularAnimals.filter(
        (animal) => !currentSet.has(animal.id),
      );

      if (validCurrentIds.length < 5 && outsideAnimals.length > 0) {
        const neededCount = 5 - validCurrentIds.length;

        const animalsToAdd = [...outsideAnimals]
          .sort((a, b) => (salesMap[b.id] ?? 0) - (salesMap[a.id] ?? 0))
          .slice(0, neededCount)
          .map((animal) => animal.id);

        nextIds = [...validCurrentIds, ...animalsToAdd];
      } else if (validCurrentIds.length === 5 && outsideAnimals.length > 0) {
        let topOutsideAnimal: Animal | null = null;
        let topOutsideSales = -1;

        for (const animal of outsideAnimals) {
          const currentSales = salesMap[animal.id] ?? 0;

          if (currentSales > topOutsideSales) {
            topOutsideSales = currentSales;
            topOutsideAnimal = animal;
          }
        }

        if (topOutsideAnimal && topOutsideSales > 0) {
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
            nextIds = [...validCurrentIds];
            nextIds[minIndex] = topOutsideAnimal.id;
          } else {
            nextIds = validCurrentIds;
          }
        } else {
          nextIds = validCurrentIds;
        }
      } else {
        nextIds = validCurrentIds;
      }

      if (nextIds.length === 5) {
        localStorage.setItem(
          POPULAR_ANIMALS_STORAGE_KEY,
          JSON.stringify(nextIds),
        );
      }

      return nextIds;
    });
  }, [initialDataReady, animals, salesMap, salesLoading]);

  const sliderAnimals = sliderAnimalIds
    .map((id) => animals.find((animal) => animal.id === id))
    .filter((animal): animal is Animal => Boolean(animal));

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
          {sliderAnimals.slice(0, 5).map((animal) => {
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
