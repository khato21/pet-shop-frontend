import { Link } from "react-router-dom";

import type { Animal } from "../../interfaces/animal.interface";
import type { Category } from "../../interfaces/category.interface";

import { useAppSelector } from "../../hooks/hooks";

import useWishlist from "../../hooks/useWishlist";
import useCart from "../../hooks/useCart";

import styles from "./AnimalCard.module.css";

interface AnimalCardProps {
  animal: Animal;
  categories?: Category[];
}

const AnimalCard = ({ animal, categories = [] }: AnimalCardProps) => {
  const currency = useAppSelector((state) => state.currency.currency);

  const cart = useAppSelector((state) => state.cart.cart);

  const { addAnimal, removeAnimal, isInWishlist } = useWishlist();

  const { addAnimal: addAnimalToCart } = useCart();

  const handleAddToCart = () => {
    addAnimalToCart(animal);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(animal.id)) {
      removeAnimal(animal.id);
    } else {
      addAnimal(animal);
    }
  };

  const isWishlisted = isInWishlist(animal.id);

  const isInCart = cart.some((item) => item.animal.id === animal.id);

  const price = currency === "GEL" ? animal.priceGEL : animal.priceUSD;

  return (
    <article className={styles.card}>
      <Link to={`/animals/${animal.id}`} className={styles.cardLink}>
        <div className={styles.imageWrapper}>
          <img
            className={styles.image}
            src={animal.imageUrl}
            alt={animal.name}
          />

          {animal.isPopular && <span className={styles.popular}>Popular</span>}
        </div>

        <div className={styles.content}>
          <h3 className={styles.name}>{animal.name}</h3>
        </div>
      </Link>

      <div className={styles.categories}>
        {categories.length > 0 ? (
          categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className={styles.categoryLink}
            >
              {category.title}
            </Link>
          ))
        ) : (
          <span className={styles.noCategory}>No category</span>
        )}
      </div>

      <div className={styles.content}>
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
    </article>
  );
};

export default AnimalCard;
