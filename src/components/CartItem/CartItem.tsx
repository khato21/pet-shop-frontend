import { Link } from "react-router-dom";

import useCart from "../../hooks/useCart";
import { useAppSelector } from "../../hooks/hooks";

import type { CartItem as CartItemType } from "../../interfaces/cart.interface";

import styles from "./CartItem.module.css";

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const { increaseAnimalQuantity, decreaseAnimalQuantity, removeAnimal } =
    useCart();

  const currency = useAppSelector((state) => state.currency.currency);

  const { animal, quantity } = item;

  const handleDecrease = () => {
    if (quantity <= 1) {
      removeAnimal(animal.id);
    } else {
      decreaseAnimalQuantity(animal.id);
    }
  };

  const handleIncrease = () => {
    increaseAnimalQuantity(animal.id);
  };

  const handleRemove = () => {
    removeAnimal(animal.id);
  };

  const price = currency === "GEL" ? animal.priceGEL : animal.priceUSD;

  const availableStock = Math.max(animal.stock - quantity, 0);

  return (
    <article className={styles.item}>
      <Link to={`/animals/${animal.id}`} className={styles.imageLink}>
        <div className={styles.imageWrapper}>
          <img
            className={styles.image}
            src={animal.imageUrl}
            alt={animal.name}
          />

          {animal.isPopular && <span className={styles.popular}>Popular</span>}
        </div>
      </Link>

      <div className={styles.info}>
        <Link to={`/animals/${animal.id}`} className={styles.nameLink}>
          <h2 className={styles.name}>{animal.name}</h2>
        </Link>

        <p className={styles.price}>
          {price.toFixed(2)} {currency}
        </p>

        <p className={styles.stock}>
          Available: {availableStock} {availableStock === 0 && "(Max reached)"}
        </p>
      </div>

      <div className={styles.quantity}>
        <button
          type="button"
          onClick={handleDecrease}
          aria-label={`Decrease quantity of ${animal.name}`}
        >
          −
        </button>

        <span>{quantity}</span>

        <button
          type="button"
          onClick={handleIncrease}
          disabled={quantity >= animal.stock}
          aria-label={`Increase quantity of ${animal.name}`}
        >
          +
        </button>
      </div>

      <button type="button" className={styles.remove} onClick={handleRemove}>
        Remove
      </button>
    </article>
  );
};

export default CartItem;
