import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { getAnimalById } from "../../store/thunks/animalThunks";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";

import useWishlist from "../../hooks/useWishlist";

import { addToCart } from "../../store/slices/cartSlice";

import styles from "./AnimalDetailsPage.module.css";

const AnimalDetailsPage = () => {
  const { id } = useParams();

  const dispatch = useAppDispatch();

  const { animals, loading, error } = useAppSelector((state) => state.animals);

  const currency = useAppSelector((state) => state.currency.currency);

  const cart = useAppSelector((state) => state.cart.cart);

  const { addAnimal, removeAnimal, isInWishlist } = useWishlist();

  useEffect(() => {
    if (id) {
      dispatch(getAnimalById(id));
    }
  }, [dispatch, id]);

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

  const isWishlisted = isInWishlist(animal.id);

  const isInCart = cart.some((item) => item.animal.id === animal.id);

  const handleAddToCart = () => {
    dispatch(addToCart(animal));

    toast.success(`${animal.name} added to cart`);
  };

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeAnimal(animal.id);
    } else {
      addAnimal(animal);
    }
  };

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

          <div className={styles.actions}>
            <button
              className={`${styles.cartButton} ${
                isInCart ? styles.cartButtonAdded : ""
              }`}
              type="button"
              onClick={handleAddToCart}
              disabled={animal.stock === 0}
            >
              {isInCart ? "ADDED TO CART ✓" : "ADD TO CART"}
            </button>

            <button
              className={styles.wishlistButton}
              type="button"
              onClick={handleWishlistToggle}
              aria-label={
                isWishlisted
                  ? `Remove ${animal.name} from wishlist`
                  : `Add ${animal.name} to wishlist`
              }
            >
              {isWishlisted ? "♥" : "♡"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AnimalDetailsPage;
