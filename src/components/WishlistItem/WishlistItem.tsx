import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import type { RootState } from "../../store";

import type { WishlistItem as WishlistItemType } from "../../interfaces/wishlist.interface";
import useWishlist from "../../hooks/useWishlist";
import useCart from "../../hooks/useCart";

import styles from "./WishlistItem.module.css";

interface WishlistItemProps {
  item: WishlistItemType;
}

const WishlistItem = ({ item }: WishlistItemProps) => {
  const { removeAnimal } = useWishlist();
  const { cart, addAnimal } = useCart();

  const { currency } = useSelector((state: RootState) => state.currency);

  const { animal } = item;

  const handleRemove = () => {
    removeAnimal(animal.id);
  };

  const handleAddToCart = () => {
    addAnimal(animal);
  };

  const isAdded = cart.some((cartItem) => cartItem.animal.id === animal.id);

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

          <p className={styles.price}>
            {price} {currency}
          </p>

          <p className={styles.stock}>Stock: {animal.stock}</p>
        </div>
      </Link>

      <div className={styles.actions}>
        <button
          className={`${styles.addButton} ${isAdded ? styles.addedButton : ""}`}
          type="button"
          onClick={handleAddToCart}
          disabled={animal.stock <= 0}
        >
          {animal.stock <= 0
            ? "OUT OF STOCK"
            : isAdded
              ? "ADDED TO CART ✓"
              : "ADD TO CART"}
        </button>

        <button
          className={styles.removeButton}
          type="button"
          onClick={handleRemove}
        >
          REMOVE
        </button>
      </div>
    </article>
  );
};

export default WishlistItem;
