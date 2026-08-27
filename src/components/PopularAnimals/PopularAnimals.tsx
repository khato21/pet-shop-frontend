import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";

import "swiper/css";

import AnimalCard from "../AnimalCard/AnimalCard";

import { useAppSelector } from "../../hooks/hooks";

import type { Animal } from "../../interfaces/animal.interface";

import styles from "./PopularAnimals.module.css";

interface PopularAnimalsProps {
  showViewAll?: boolean;
}

const PopularAnimals = ({ showViewAll = false }: PopularAnimalsProps) => {
  const swiperRef = useRef<SwiperInstance | null>(null);

  const [sliderAnimals, setSliderAnimals] = useState<Animal[]>([]);

  const initializedRef = useRef(false);
  const previousSalesCountRef = useRef(0);

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

  /*
   * თავიდან სლაიდერში ყოველთვის პირველი 5 პოპულარული ცხოველია.
   *
   * აქ sales საერთოდ არ მონაწილეობს.
   */
  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    const initialPopularAnimals = animals
      .filter((animal) => animal.isPopular)
      .slice(0, 5);

    if (initialPopularAnimals.length === 0) {
      return;
    }

    setSliderAnimals(initialPopularAnimals);
    initializedRef.current = true;
  }, [animals]);

  /*
   * ახალი გაყიდვების დათვლა.
   *
   * sales-ში მხოლოდ createSale()-ით დამატებული ახალი გაყიდვებია,
   * რადგან getSales() აღარ იძახება.
   */
  const salesByAnimalId = useMemo(() => {
    return sales.reduce<Record<string, number>>((totalSales, sale) => {
      totalSales[sale.animalId] =
        (totalSales[sale.animalId] ?? 0) + sale.quantity;

      return totalSales;
    }, {});
  }, [sales]);

  /*
   * სლაიდერის გადალაგება ხდება მხოლოდ ახალი Sale-ის შექმნის შემდეგ.
   *
   * საწყისი 5 არ იცვლება ძველი მონაცემებით,
   * რადგან ძველი sales საერთოდ არ იტვირთება.
   */
  useEffect(() => {
    if (!initializedRef.current) {
      return;
    }

    if (sales.length === 0) {
      return;
    }

    /*
     * თუ sales-ის რაოდენობა არ გაზრდილა,
     * ახალი გაყიდვა არ მომხდარა.
     */
    if (sales.length <= previousSalesCountRef.current) {
      return;
    }

    previousSalesCountRef.current = sales.length;

    setSliderAnimals((currentSliderAnimals) => {
      if (currentSliderAnimals.length === 0) {
        return currentSliderAnimals;
      }

      const popularAnimals = animals.filter((animal) => animal.isPopular);

      const outsideSliderAnimals = popularAnimals.filter(
        (animal) =>
          !currentSliderAnimals.some(
            (sliderAnimal) => sliderAnimal.id === animal.id,
          ),
      );

      if (outsideSliderAnimals.length === 0) {
        return currentSliderAnimals;
      }

      /*
       * ვპოულობთ Slider-ის გარეთ ყველაზე მეტ გაყიდვიან პოპულარულს.
       */
      let mostSoldOutsideAnimalIndex = 0;

      for (let index = 1; index < outsideSliderAnimals.length; index += 1) {
        const currentAnimal = outsideSliderAnimals[index];
        const mostSoldAnimal = outsideSliderAnimals[mostSoldOutsideAnimalIndex];

        const currentSales = salesByAnimalId[currentAnimal.id] ?? 0;
        const mostSoldSales = salesByAnimalId[mostSoldAnimal.id] ?? 0;

        if (currentSales > mostSoldSales) {
          mostSoldOutsideAnimalIndex = index;
        }
      }

      const mostSoldOutsideAnimal =
        outsideSliderAnimals[mostSoldOutsideAnimalIndex];

      const mostSoldOutsideSales =
        salesByAnimalId[mostSoldOutsideAnimal.id] ?? 0;

      /*
       * ვპოულობთ Slider-ში ყველაზე ნაკლებად გაყიდულს.
       */
      let leastSoldSliderIndex = 0;

      for (let index = 1; index < currentSliderAnimals.length; index += 1) {
        const currentSliderAnimal = currentSliderAnimals[index];
        const leastSoldAnimal = currentSliderAnimals[leastSoldSliderIndex];

        const currentSales = salesByAnimalId[currentSliderAnimal.id] ?? 0;
        const leastSoldSales = salesByAnimalId[leastSoldAnimal.id] ?? 0;

        if (currentSales < leastSoldSales) {
          leastSoldSliderIndex = index;
        }
      }

      const leastSoldSliderAnimal = currentSliderAnimals[leastSoldSliderIndex];

      const leastSoldSliderSales =
        salesByAnimalId[leastSoldSliderAnimal.id] ?? 0;

      /*
       * მხოლოდ მაშინ ვანაცვლებთ,
       * როცა Slider-ის გარეთ მყოფმა ნამდვილად მეტი გაყიდა.
       */
      if (mostSoldOutsideSales > leastSoldSliderSales) {
        const updatedSliderAnimals = [...currentSliderAnimals];

        updatedSliderAnimals[leastSoldSliderIndex] = mostSoldOutsideAnimal;

        return updatedSliderAnimals;
      }

      return currentSliderAnimals;
    });
  }, [sales, salesByAnimalId, animals]);

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
          aria-label="Next popular animals"
        >
          ›
        </button>
      </div>
    </section>
  );
};

export default PopularAnimals;
