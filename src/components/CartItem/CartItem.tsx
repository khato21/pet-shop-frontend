import { Link } from "react-router-dom";

import useCart from "../../hooks/useCart";

import type { CartItem as CartItemType } from "../../interfaces/cart.interface";

import styles from "./CartItem.module.css";

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const { increaseAnimalQuantity, decreaseAnimalQuantity, removeAnimal } =
    useCart();

  const { animal, quantity } = item;

  const handleDecrease = () => {
    decreaseAnimalQuantity(animal.id);
  };

  const handleIncrease = () => {
    increaseAnimalQuantity(animal.id);
  };

  const handleRemove = () => {
    removeAnimal(animal.id);
  };

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

        <p className={styles.price}>{animal.priceGEL} GEL</p>

        <p className={styles.stock}>Stock: {animal.stock}</p>
      </div>

      <div className={styles.quantity}>
        <button
          type="button"
          onClick={handleDecrease}
          disabled={quantity === 1}
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
