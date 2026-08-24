import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import { getAnimals } from "../../store/thunks/animalThunks";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";

import styles from "./AnimalDetailsPage.module.css";

const AnimalDetailsPage = () => {
  const { id } = useParams();

  const dispatch = useAppDispatch();

  const { animals, loading, error } = useAppSelector((state) => state.animals);

  const currency = useAppSelector((state) => state.currency.currency);

  useEffect(() => {
    dispatch(getAnimals());
  }, [dispatch]);

  const animal = animals.find((animal) => animal.id === id);

  if (loading && !animal) {
    return <p>Loading animal...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!animal) {
    return <p>Animal not found.</p>;
  }

  const price = currency === "GEL" ? animal.priceGEL : animal.priceUSD;

  return (
    <main className={styles.page}>
      <Link to="/animals" className={styles.backLink}>
        ← Back to Animals
      </Link>

      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          <img
            className={styles.image}
            src={animal.imageUrl}
            alt={animal.name}
          />
        </div>

        <div className={styles.content}>
          <h1 className={styles.title}>{animal.name}</h1>

          <p className={styles.description}>{animal.description}</p>

          <div className={styles.info}>
            <p className={styles.price}>
              {price} {currency}
            </p>

            <p className={styles.stock}>Stock: {animal.stock}</p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AnimalDetailsPage;
