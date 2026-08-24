import { Link } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../hooks/hooks";
import { toggleCurrency } from "../../store/slices/currencySlice";

import styles from "./Header.module.css";

const Header = () => {
  const dispatch = useAppDispatch();

  const cart = useAppSelector((state) => state.cart.cart);
  const wishlist = useAppSelector((state) => state.wishlist.wishlist);
  const currency = useAppSelector((state) => state.currency.currency);

  const cartQuantity = cart.reduce((total, item) => total + item.quantity, 0);

  const wishlistQuantity = wishlist.length;

  const handleCurrencyToggle = () => {
    dispatch(toggleCurrency());
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          PET SHOP
        </Link>

        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>
            Home
          </Link>

          <Link to="/animals" className={styles.navLink}>
            Animals
          </Link>

          <Link to="/categories" className={styles.navLink}>
            Categories
          </Link>

          <Link to="/about-us" className={styles.navLink}>
            About Us
          </Link>
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.currencyButton}
            onClick={handleCurrencyToggle}
            aria-label={`Change currency. Current currency: ${currency}`}
          >
            <span
              className={
                currency === "GEL"
                  ? styles.activeCurrency
                  : styles.inactiveCurrency
              }
            >
              GEL
            </span>

            <span className={styles.divider}>/</span>

            <span
              className={
                currency === "USD"
                  ? styles.activeCurrency
                  : styles.inactiveCurrency
              }
            >
              USD
            </span>
          </button>

          <Link
            to="/wishlist"
            className={styles.iconLink}
            aria-label={`Wishlist, ${wishlistQuantity} items`}
          >
            <svg
              className={styles.heartIcon}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className={styles.cartCount}>{wishlistQuantity}</span>
          </Link>

          <Link
            to="/cart"
            className={styles.iconLink}
            aria-label={`Cart, ${cartQuantity} items`}
          >
            <svg
              className={styles.cartIcon}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M3 4h2l1.5 10.5a2 2 0 0 0 2 1.5h7.9a2 2 0 0 0 2-1.5L20 7H6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="10"
                cy="20"
                r="1.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <circle
                cx="18"
                cy="20"
                r="1.2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>

            <span className={styles.cartCount}>{cartQuantity}</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
