import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import type { RootState } from "../../store";

import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { useWebSocket } from "../../hooks/useWebSocket";

import { clearCart } from "../../store/slices/cartSlice";
import { updateWishlistAnimal } from "../../store/slices/wishlistSlice";
import { updateAnimal } from "../../store/thunks/animalThunks";
import { createSale } from "../../store/thunks/saleThunks";

import styles from "./CheckoutPage.module.css";

const CheckoutPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [buying, setBuying] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const cart = useAppSelector((state) => state.cart.cart);

  const { currency } = useSelector((state: RootState) => state.currency);

  const { sendMessage } = useWebSocket(() => {});

  const totalPrice = cart.reduce((total, item) => {
    const price =
      currency === "GEL" ? item.animal.priceGEL : item.animal.priceUSD;

    return total + price * item.quantity;
  }, 0);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

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

  const handleBuyNow = async () => {
    setBuying(true);

    try {
      for (const item of cart) {
        const updatedStock = item.animal.stock - item.quantity;

        const updatedAnimal = await dispatch(
          updateAnimal({
            id: item.animal.id,
            animal: {
              name: item.animal.name,
              priceUSD: item.animal.priceUSD,
              priceGEL: item.animal.priceGEL,
              description: item.animal.description,
              isPopular: item.animal.isPopular,
              stock: updatedStock,
              imageUrl: item.animal.imageUrl,
            },
          }),
        ).unwrap();

        dispatch(updateWishlistAnimal(updatedAnimal));

        await dispatch(
          createSale({
            animalId: item.animal.id,
            quantity: item.quantity,
          }),
        ).unwrap();

        sendMessage(
          JSON.stringify({
            type: "RESOURCE_CHANGED",
            source: "SHOP",
            action: "UPDATE",
            resource: "animals",
            id: item.animal.id,
          }),
        );
      }

      dispatch(clearCart());

      toast.success("Order placed successfully!");

      navigate("/cart");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBuying(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Checkout</h1>

          <p className={styles.empty}>Your cart is empty.</p>

          <Link to="/animals" className={styles.backButton}>
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

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Checkout</h1>

        <Link to="/cart" className={styles.backLink}>
          ← Back to Cart
        </Link>

        <div className={styles.list}>
          {cart.map((item) => {
            const price =
              currency === "GEL" ? item.animal.priceGEL : item.animal.priceUSD;

            const subtotal = price * item.quantity;

            return (
              <article key={item.animal.id} className={styles.item}>
                <Link
                  to={`/animals/${item.animal.id}`}
                  className={styles.imageLink}
                >
                  <div className={styles.imageWrapper}>
                    <img
                      className={styles.image}
                      src={item.animal.imageUrl}
                      alt={item.animal.name}
                    />

                    {item.animal.isPopular && (
                      <span className={styles.popularBadge}>Popular</span>
                    )}
                  </div>
                </Link>

                <div className={styles.info}>
                  <Link
                    to={`/animals/${item.animal.id}`}
                    className={styles.nameLink}
                  >
                    <h2 className={styles.name}>{item.animal.name}</h2>
                  </Link>

                  <p className={styles.price}>
                    {price.toFixed(2)} {currency}
                  </p>

                  <p className={styles.quantity}>Quantity: {item.quantity}</p>

                  <p className={styles.subtotal}>
                    Subtotal:{" "}
                    <strong>
                      {subtotal.toFixed(2)} {currency}
                    </strong>
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.summary}>
          <p className={styles.total}>
            Total:{" "}
            <strong>
              {totalPrice.toFixed(2)} {currency}
            </strong>
          </p>

          <button
            type="button"
            className={styles.buyButton}
            onClick={handleBuyNow}
            disabled={buying}
          >
            {buying ? "Processing..." : "BUY NOW"}
          </button>
        </div>
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

export default CheckoutPage;
