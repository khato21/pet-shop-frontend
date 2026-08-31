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

  const [sliderAnimals, setSliderAnimals] = useState<Animal[]>([]);
  const [salesMap, setSalesMap] = useState<Record<string, number>>({});

  const {
    animals,
    loading: animalsLoading,
    error: animalsError,
  } = useAppSelector((state) => state.animals);

  const { sales } = useAppSelector((state) => state.sales);

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
    dispatch(getAnimals());
    dispatch(getCategories());
    dispatch(getAnimalWithCategories());
    dispatch(getSales());
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
        const isInSlider = sliderAnimals.some(
          (animal) => animal.id === message.id,
        );

        if (!isInSlider) {
          return;
        }

        try {
          const updatedAnimal = await dispatch(
            getAnimalById(message.id),
          ).unwrap();

          setSliderAnimals((currentSliderAnimals) =>
            currentSliderAnimals.map((animal) =>
              animal.id === updatedAnimal.id ? updatedAnimal : animal,
            ),
          );
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
        message.resource !== "sales" ||
        message.action !== "CREATE"
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
    [dispatch, sliderAnimals],
  );

  useWebSocket(handleWebSocketMessage);

  useEffect(() => {
    if (animals.length === 0 || sliderAnimals.length > 0) return;

    const popular = animals.filter((a) => a.isPopular).slice(0, 5);

    setSliderAnimals(popular);
  }, [animals, sliderAnimals.length]);

  useEffect(() => {
    if (animals.length === 0 || sliderAnimals.length === 0) return;

    setSliderAnimals((currentSliderAnimals) => {
      let hasChanges = false;

      const updatedSliderAnimals = currentSliderAnimals.map((sliderAnimal) => {
        const updatedAnimal = animals.find(
          (animal) => animal.id === sliderAnimal.id,
        );

        if (updatedAnimal && updatedAnimal !== sliderAnimal) {
          hasChanges = true;
          return updatedAnimal;
        }

        return sliderAnimal;
      });

      return hasChanges ? updatedSliderAnimals : currentSliderAnimals;
    });
  }, [animals]);

  useEffect(() => {
    if (animals.length === 0 || sliderAnimals.length === 0) return;

    const popularAnimals = animals.filter((a) => a.isPopular);

    const sliderIds = new Set(sliderAnimals.map((a) => a.id));

    const outsideAnimals = popularAnimals.filter((a) => !sliderIds.has(a.id));

    if (outsideAnimals.length === 0) return;

    let topOutsideAnimal: Animal | null = null;
    let topOutsideSales = -1;

    for (const animal of outsideAnimals) {
      const currentSales = salesMap[animal.id] ?? 0;

      if (currentSales > topOutsideSales) {
        topOutsideSales = currentSales;
        topOutsideAnimal = animal;
      }
    }

    if (!topOutsideAnimal || topOutsideSales <= 0) return;

    let minIndex = 0;
    let minSales = salesMap[sliderAnimals[0].id] ?? 0;

    for (let i = 1; i < sliderAnimals.length; i++) {
      const currentSales = salesMap[sliderAnimals[i].id] ?? 0;

      if (currentSales < minSales) {
        minSales = currentSales;
        minIndex = i;
      }
    }

    if (topOutsideSales > minSales) {
      const nextSlider = [...sliderAnimals];

      nextSlider[minIndex] = topOutsideAnimal;

      setSliderAnimals(nextSlider);
    }
  }, [salesMap, animals, sliderAnimals]);

  useEffect(() => {
    swiperRef.current?.update();
  }, [sliderAnimals]);

  const loading = animalsLoading || categoriesLoading || relationsLoading;

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
