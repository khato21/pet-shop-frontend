import { useEffect, useState } from "react";

import Hero from "../../components/Hero/Hero";
import CategoriesPanel from "../../components/CategoriesPanel/CategoriesPanel";
import PopularAnimals from "../../components/PopularAnimals/PopularAnimals";

import styles from "./HomePage.module.css";

const HomePage = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);

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

  return (
    <main>
      <Hero />

      <CategoriesPanel />

      <PopularAnimals showViewAll />

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

export default HomePage;
