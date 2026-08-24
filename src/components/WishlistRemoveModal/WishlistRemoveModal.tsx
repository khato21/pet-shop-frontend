import useWishlist from "../../hooks/useWishlist";

import type { WishlistItem } from "../../interfaces/wishlist.interface";

import styles from "./WishlistRemoveModal.module.css";

interface WishlistRemoveModalProps {
  wishlist: WishlistItem[];
  onClose: () => void;
}

const WishlistRemoveModal = ({
  wishlist,
  onClose,
}: WishlistRemoveModalProps) => {
  const { removeAnimal, removeAllAnimals } = useWishlist();

  const handleRemove = (animalId: string) => {
    removeAnimal(animalId);
  };

  const handleRemoveAll = () => {
    removeAllAnimals();
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Remove from Wishlist</h2>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className={styles.list}>
          {wishlist.map((item) => (
            <div className={styles.item} key={item.animal.id}>
              <div className={styles.animalInfo}>
                <img
                  className={styles.image}
                  src={item.animal.imageUrl}
                  alt={item.animal.name}
                />

                <span className={styles.name}>{item.animal.name}</span>
              </div>

              <button
                type="button"
                className={styles.removeButton}
                onClick={() => handleRemove(item.animal.id)}
              >
                REMOVE
              </button>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.clearAllButton}
            onClick={handleRemoveAll}
          >
            CLEAR ALL
          </button>

          <button
            type="button"
            className={styles.closeFooterButton}
            onClick={onClose}
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistRemoveModal;
