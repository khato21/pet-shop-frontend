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

  // 1. WebSocket handler - ითვალისწინებს isPopular სტატუსის დაკარგვას/მიღებას
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

          setSliderAnimals((currentSlider) => {
            const isInSlider = currentSlider.some(
              (animal) => animal.id === updatedAnimal.id,
            );

            // შემთხვევა ა: ცხოველს მოეხსნა პოპულარობის სტატუსი (isPopular = false)
            if (!updatedAnimal.isPopular) {
              if (!isInSlider) return currentSlider; // ისედაც არ იყო სლაიდერში
              // ამოვიღოთ სლაიდერიდან
              return currentSlider.filter((a) => a.id !== updatedAnimal.id);
            }

            // შემთხვევა ბ: ცხოველი არის სლაიდერში და განახლდა მისი ინფო
            if (isInSlider) {
              return currentSlider.map((animal) =>
                animal.id === updatedAnimal.id ? updatedAnimal : animal,
              );
            }

            // შემთხვევა გ: გახდა პოპულარული (isPopular = true) და სლაიდერში 5-ზე ნაკლებია
            if (currentSlider.length < 5) {
              return [...currentSlider, updatedAnimal];
            }

            return currentSlider;
          });
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
    [dispatch],
  );

  useWebSocket(handleWebSocketMessage);

  // 2. საწყისი ჩატვირთვა
  useEffect(() => {
    if (animals.length === 0 || sliderAnimals.length > 0) return;

    const popular = animals.filter((a) => a.isPopular).slice(0, 5);
    setSliderAnimals(popular);
  }, [animals, sliderAnimals.length]);

  // 3. Redux state-ის ცვლილებისას სლაიდერის გაფილტვრა და განახლება
  useEffect(() => {
    if (animals.length === 0 || sliderAnimals.length === 0) return;

    setSliderAnimals((currentSlider) => {
      let hasChanges = false;

      // 1. ჯერ ვფილტრავთ იმ ცხოველებს, რომლებსაც isPopular გახდა false
      const filteredSlider = currentSlider.filter((sliderAnimal) => {
        const reduxAnimal = animals.find((a) => a.id === sliderAnimal.id);
        // თუ Redux-ში ეს ცხოველი აღარ არის პოპულარული, ვშლით სლაიდერიდან
        if (reduxAnimal && !reduxAnimal.isPopular) {
          hasChanges = true;
          return false;
        }
        return true;
      });

      // 2. ვანახლებთ მონაცემებს დარჩენილი ცხოველებისთვის
      const updatedSlider = filteredSlider.map((sliderAnimal) => {
        const reduxAnimal = animals.find((a) => a.id === sliderAnimal.id);

        if (
          reduxAnimal &&
          JSON.stringify(reduxAnimal) !== JSON.stringify(sliderAnimal)
        ) {
          hasChanges = true;
          return reduxAnimal;
        }

        return sliderAnimal;
      });

      return hasChanges ? updatedSlider : currentSlider;
    });
  }, [animals]);

  // 4. თუ სლაიდერში 5-ზე ნაკლები ცხოველი დარჩა (ამოშლის გამო) ან გაყიდვებით ჩანაცვლებაა საჭირო
  useEffect(() => {
    if (animals.length === 0) return;

    const popularAnimals = animals.filter((a) => a.isPopular);
    const sliderIds = new Set(sliderAnimals.map((a) => a.id));

    const outsideAnimals = popularAnimals.filter((a) => !sliderIds.has(a.id));

    // ა) თუ სლაიდერში 5-ზე ნაკლებია და გარეთ არის პოპულარული ცხოველები — შევავსოთ 5-მდე
    if (sliderAnimals.length < 5 && outsideAnimals.length > 0) {
      const neededCount = 5 - sliderAnimals.length;
      const animalsToAdd = outsideAnimals.slice(0, neededCount);
      setSliderAnimals((prev) => [...prev, ...animalsToAdd]);
      return;
    }

    if (sliderAnimals.length === 0 || outsideAnimals.length === 0) return;

    // ბ) გაყიდვების მიხედვით ყველაზე პოპულარულის შეყვანა სლაიდერში
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
