import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";

import "swiper/css";

import AnimalCard from "../AnimalCard/AnimalCard";

import { useAppDispatch, useAppSelector } from "../../hooks/hooks";

import { getAnimals } from "../../store/thunks/animalThunks";
import { getCategories } from "../../store/thunks/categoryThunks";
import { getAnimalWithCategories } from "../../store/thunks/animalWithCategoryThunks";
import { getSales } from "../../store/thunks/saleThunks";

import styles from "./PopularAnimals.module.css";

interface PopularAnimalsProps {
  showViewAll?: boolean;
}

const PopularAnimals = ({ showViewAll = false }: PopularAnimalsProps) => {
  const swiperRef = useRef<SwiperInstance | null>(null);

  const dispatch = useAppDispatch();

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

  const { sales } = useAppSelector((state) => state.sales);

  useEffect(() => {
    dispatch(getAnimals());
    dispatch(getCategories());
    dispatch(getAnimalWithCategories());
    dispatch(getSales());
  }, [dispatch]);

  const salesByAnimalId = useMemo(() => {
    return sales.reduce<Record<string, number>>((totalSales, sale) => {
      totalSales[sale.animalId] =
        (totalSales[sale.animalId] ?? 0) + sale.quantity;

      return totalSales;
    }, {});
  }, [sales]);

  const popularAnimals = useMemo(() => {
    const popularAnimalsList = animals.filter((animal) => animal.isPopular);

    const initialSliderAnimals = popularAnimalsList.slice(0, 5);

    if (initialSliderAnimals.length <= 1) {
      return initialSliderAnimals;
    }

    const sliderAnimals = [...initialSliderAnimals];

    const outsidePopularAnimals = popularAnimalsList.filter(
      (animal) =>
        !initialSliderAnimals.some(
          (sliderAnimal) => sliderAnimal.id === animal.id,
        ),
    );

    const remainingAnimals = [...outsidePopularAnimals];

    while (remainingAnimals.length > 0 && sliderAnimals.length > 0) {
      let mostSoldOutsideAnimalIndex = 0;

      for (let index = 1; index < remainingAnimals.length; index += 1) {
        const currentAnimal = remainingAnimals[index];
        const mostSoldAnimal = remainingAnimals[mostSoldOutsideAnimalIndex];

        const currentSales = salesByAnimalId[currentAnimal.id] ?? 0;
        const mostSoldOutsideSales = salesByAnimalId[mostSoldAnimal.id] ?? 0;

        if (currentSales > mostSoldOutsideSales) {
          mostSoldOutsideAnimalIndex = index;
        }
      }

      const mostSoldOutsideAnimal =
        remainingAnimals[mostSoldOutsideAnimalIndex];

      const mostSoldOutsideSales =
        salesByAnimalId[mostSoldOutsideAnimal.id] ?? 0;

      let leastSoldSliderIndex = 0;

      for (let index = 1; index < sliderAnimals.length; index += 1) {
        const currentSliderAnimal = sliderAnimals[index];
        const leastSoldSliderAnimal = sliderAnimals[leastSoldSliderIndex];

        const currentSliderSales = salesByAnimalId[currentSliderAnimal.id] ?? 0;

        const leastSoldSliderSales =
          salesByAnimalId[leastSoldSliderAnimal.id] ?? 0;

        if (currentSliderSales < leastSoldSliderSales) {
          leastSoldSliderIndex = index;
        }
      }

      const leastSoldSliderAnimal = sliderAnimals[leastSoldSliderIndex];

      const leastSoldSliderSales =
        salesByAnimalId[leastSoldSliderAnimal.id] ?? 0;

      if (mostSoldOutsideSales > leastSoldSliderSales) {
        sliderAnimals[leastSoldSliderIndex] = mostSoldOutsideAnimal;
      } else {
        break;
      }

      remainingAnimals.splice(mostSoldOutsideAnimalIndex, 1);
    }

    return sliderAnimals;
  }, [animals, salesByAnimalId]);

  const loading = animalsLoading || categoriesLoading || relationsLoading;

  const error = animalsError || categoriesError || relationsError;

  if (loading && animals.length === 0) {
    return <p>Loading popular animals...</p>;
  }

  if (error && popularAnimals.length === 0) {
    return <p>{error}</p>;
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Popular Animals</h2>

        {showViewAll && (
          <Link to="/animals/popular" className={styles.viewAllButton}>
            VIEW ALL
            <span className={styles.viewAllArrow} aria-hidden="true">
              →
            </span>
          </Link>
        )}
      </div>

      <div className={styles.sliderWrapper}>
        <button
          type="button"
          className={`${styles.navigationButton} ${styles.prevButton}`}
          onClick={() => swiperRef.current?.slidePrev()}
          aria-label="Previous popular animals"
        >
          ‹
        </button>

        <Swiper
          className={styles.swiper}
          spaceBetween={24}
          slidesPerView={1}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          breakpoints={{
            600: {
              slidesPerView: 2,
            },
            900: {
              slidesPerView: 3,
            },
            1100: {
              slidesPerView: 4,
            },
          }}
        >
          {popularAnimals.map((animal) => {
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
          aria-label="Next popular animals"
        >
          ›
        </button>
      </div>
    </section>
  );
};

export default PopularAnimals;
