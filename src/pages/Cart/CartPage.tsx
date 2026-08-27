import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { useWebSocket } from "../../hooks/useWebSocket";

import { getAnimalById } from "../../store/thunks/animalThunks";
import { updateCartAnimal } from "../../store/slices/cartSlice";

import type { WebSocketMessage } from "../../interfaces/websocket.interface";

import CartItem from "../../components/CartItem/CartItem";

import styles from "./CartPage.module.css";

const CartPage = () => {
  const dispatch = useAppDispatch();

  const cart = useAppSelector((state) => state.cart.cart);

  const currency = useAppSelector((state) => state.currency.currency);

  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleWebSocketMessage = useCallback(
    async (message: WebSocketMessage) => {
      if (
        message.type === "RESOURCE_CHANGED" &&
        message.source === "ADMIN" &&
        message.resource === "animals" &&
        message.action === "UPDATE" &&
        message.id
      ) {
        console.log("Cart animal changed via WebSocket:", message.id);

        const isInCart = cart.some((item) => item.animal.id === message.id);

        if (!isInCart) {
          return;
        }

        try {
          const updatedAnimal = await dispatch(
            getAnimalById(message.id),
          ).unwrap();

          console.log("🔥 UPDATED ANIMAL FROM GET:", updatedAnimal);

          dispatch(updateCartAnimal(updatedAnimal));

          console.log(
            "Cart animal updated:",
            updatedAnimal.name,
            updatedAnimal.id,
          );
        } catch (error) {
          console.error("Failed to update cart animal via WebSocket:", error);
        }
      }
    },
    [cart, dispatch],
  );

  useWebSocket(handleWebSocketMessage);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (cart.length === 0) {
    return (
      <main className={styles.page}>
        <h1 className={styles.title}>Cart</h1>

        <p className={styles.empty}>Your cart is empty.</p>

        <div className={styles.continueShopping}>
          <Link to="/animals" className={styles.backLink}>
            ← CONTINUE SHOPPING
          </Link>
        </div>

        {showBackToTop && (
          <button
            type="button"
            className={styles.backToTop}
            onClick={handleBackToTop}
            aria-label="Back to top"
          >
            <svg
              className={styles.backToTopIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M7 14L12 9L17 14"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
      </main>
    );
  }

  const totalPrice = cart.reduce(
    (total, item) =>
      total +
      (currency === "GEL" ? item.animal.priceGEL : item.animal.priceUSD) *
        item.quantity,
    0,
  );

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Cart</h1>

      <div className={styles.continueShopping}>
        <Link to="/animals" className={styles.backLink}>
          ← CONTINUE SHOPPING
        </Link>
      </div>

      <div className={styles.list}>
        {cart.map((item) => (
          <CartItem key={item.animal.id} item={item} />
        ))}
      </div>

      <div className={styles.summary}>
        <p className={styles.total}>
          Total:{" "}
          <strong>
            {totalPrice.toFixed(2)} {currency}
          </strong>
        </p>

        <Link to="/checkout" className={styles.checkoutButton}>
          Checkout
        </Link>
      </div>

      {showBackToTop && (
        <button
          type="button"
          className={styles.backToTop}
          onClick={handleBackToTop}
          aria-label="Back to top"
        >
          <svg
            className={styles.backToTopIcon}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M7 14L12 9L17 14"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </main>
  );
};

export default CartPage;
