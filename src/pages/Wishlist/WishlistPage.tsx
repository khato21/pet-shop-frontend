import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import useWishlist from "../../hooks/useWishlist";
import useCart from "../../hooks/useCart";

import WishlistItem from "../../components/WishlistItem/WishlistItem";
import WishlistRemoveModal from "../../components/WishlistRemoveModal/WishlistRemoveModal";

import styles from "./WishlistPage.module.css";

const WishlistPage = () => {
  const { wishlist } = useWishlist();
  const { addAllAnimals } = useCart();

  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleOpenRemoveModal = () => {
    setIsRemoveModalOpen(true);
  };

  const handleCloseRemoveModal = () => {
    setIsRemoveModalOpen(false);
  };

  const handleAddAllToCart = () => {
    addAllAnimals(wishlist.map((item) => item.animal));
  };

  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Wishlist</h1>

        {wishlist.length > 0 && (
          <div className={styles.actions}>
            <button
              className={styles.removeButton}
              type="button"
              onClick={handleOpenRemoveModal}
            >
              REMOVE
            </button>

            <button
              className={styles.addAllButton}
              type="button"
              onClick={handleAddAllToCart}
            >
              ADD ALL TO CART
            </button>
          </div>
        )}
      </div>

      <div className={styles.continueWrapper}>
        <Link to="/animals" className={styles.continueLink}>
          ← CONTINUE SHOPPING
        </Link>
      </div>

      {wishlist.length === 0 ? (
        <p className={styles.emptyMessage}>Your wishlist is empty.</p>
      ) : (
        <section className={styles.list}>
          {wishlist.map((item) => (
            <WishlistItem key={item.animal.id} item={item} />
          ))}
        </section>
      )}

      {isRemoveModalOpen && (
        <WishlistRemoveModal
          wishlist={wishlist}
          onClose={handleCloseRemoveModal}
        />
      )}

      {showScrollTop && (
        <button
          type="button"
          className={styles.scrollTopButton}
          onClick={handleScrollTop}
          aria-label="Scroll to top"
        >
          <svg
            className={styles.scrollTopIcon}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              d="M6 14l6-6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </main>
  );
};

export default WishlistPage;
