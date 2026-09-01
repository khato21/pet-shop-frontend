import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getAnimalById } from "../../store/thunks/animalThunks";
import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { useWebSocket } from "../../hooks/useWebSocket";

import type { Animal } from "../../interfaces/animal.interface";
import type { WebSocketMessage } from "../../interfaces/websocket.interface";

import useWishlist from "../../hooks/useWishlist";
import useCart from "../../hooks/useCart";

import styles from "./AnimalDetailsPage.module.css";

const AnimalDetailsPage = () => {
  const { id } = useParams();

  const dispatch = useAppDispatch();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currency = useAppSelector((state) => state.currency.currency);

  const cart = useAppSelector((state) => state.cart.cart);

  const { addAnimal, removeAnimal, isInWishlist } = useWishlist();

  const { addAnimal: addAnimalToCart } = useCart();

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadAnimal = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await dispatch(getAnimalById(id)).unwrap();

        setAnimal(result);
      } catch (error) {
        console.error("Failed to load animal:", error);
        setError("Failed to load animal.");
      } finally {
        setLoading(false);
      }
    };

    loadAnimal();
  }, [dispatch, id]);

  const handleWebSocketMessage = useCallback(
    async (message: WebSocketMessage) => {
      if (
        message.type === "RESOURCE_CHANGED" &&
        message.source === "ADMIN" &&
        message.action === "UPDATE" &&
        message.resource === "animals" &&
        message.id &&
        message.id === id
      ) {
        console.log("🔥 Animal Details changed via WebSocket:", message.id);

        try {
          const updatedAnimal = await dispatch(
            getAnimalById(message.id),
          ).unwrap();

          setAnimal(updatedAnimal);

          console.log(
            "🔥 Animal Details updated:",
            updatedAnimal.name,
            "Stock:",
            updatedAnimal.stock,
            "Image:",
            updatedAnimal.imageUrl,
          );
        } catch (error) {
          console.error(
            "Failed to update animal details via WebSocket:",
            error,
          );
        }
      }
    },
    [dispatch, id],
  );

  useWebSocket(handleWebSocketMessage);

  if (loading) {
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
    addAnimalToCart(animal);
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

          {animal.isPopular && <span className={styles.popular}>Popular</span>}
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
              disabled={animal.stock === 0 || isInCart}
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
