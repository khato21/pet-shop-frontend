import { Link } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector } from "../../hooks/hooks";

import CartItem from "../../components/CartItem/CartItem";

import { getAnimalById } from "../../store/thunks/animalThunks";

import { useWebSocket } from "../../hooks/useWebSocket";

import type { WebSocketMessage } from "../../interfaces/websocket.interface";

import styles from "./CartPage.module.css";

const CartPage = () => {
  const dispatch = useAppDispatch();

  const cart = useAppSelector((state) => state.cart.cart);

  const [showBackToTop, setShowBackToTop] = useState(false);

  const handleWebSocketMessage = useCallback(
    async (message: WebSocketMessage) => {
      // ANIMAL UPDATE
      // Admin-ში ცხოველის stock-ის ან სხვა მონაცემის
      // ცვლილების შემდეგ Cart-ში არსებული იგივე
      // ცხოველი თავიდან წამოვიღოთ.
      if (
        message.type === "RESOURCE_CHANGED" &&
        message.resource === "animals" &&
        message.action === "UPDATE" &&
        message.id
      ) {
        const cartItem = cart.find((item) => item.animal.id === message.id);

        // თუ ეს ცხოველი Cart-ში არ გვაქვს,
        // Cart-ისთვის არაფერია გასაკეთებელი.
        if (!cartItem) {
          return;
        }

        const previousStock = cartItem.animal.stock;

        console.log("Cart animal changed via WebSocket:", message.id);

        try {
          const freshAnimal = await dispatch(
            getAnimalById(message.id),
          ).unwrap();

          // Toast მხოლოდ მაშინ გამოვაჩინოთ,
          // თუ stock რეალურად შეიცვალა.
          if (previousStock !== freshAnimal.stock) {
            toast.info(
              `${freshAnimal.name} stock updated: ${previousStock} → ${freshAnimal.stock}`,
            );
          }
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
    (total, item) => total + item.animal.priceGEL * item.quantity,
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
          Total: <strong>{totalPrice.toFixed(2)} GEL</strong>
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
