import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import type { KeyboardEvent, MouseEvent } from "react";

import type { Category } from "../../interfaces/category.interface";

import { getCategories } from "../../store/thunks/categoryThunks";

import { useAppDispatch, useAppSelector } from "../../hooks/hooks";

import CategoryIcon from "../CategoryIcon/CategoryIcon";

import styles from "./CategoriesPanel.module.css";

const CategoriesPanel = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const categories = useAppSelector((state) => state.categories.categories);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(getCategories());
    }
  }, [dispatch, categories.length]);

  const categoryOrder = ["Birds", "Dogs", "Fish", "Cats"];

  const popularCategories = [...categories]
    .filter((category) => categoryOrder.includes(category.title))
    .sort((a: Category, b: Category) => {
      return categoryOrder.indexOf(a.title) - categoryOrder.indexOf(b.title);
    })
    .slice(0, 4);

  const handlePanelClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest("a")) {
      return;
    }

    navigate("/categories");
  };

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const target = event.target as HTMLElement;

    if (target.closest("a")) {
      return;
    }

    event.preventDefault();

    navigate("/categories");
  };

  return (
    <section
      className={styles.section}
      onClick={handlePanelClick}
      onKeyDown={handlePanelKeyDown}
      role="link"
      tabIndex={0}
      aria-label="View all categories"
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Categories</h2>
        </div>

        <div className={styles.list}>
          {popularCategories.map((category) => {
            return (
              <Link
                key={category.id}
                to={`/categories/${category.id}`}
                className={styles.category}
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <div className={styles.iconWrapper}>
                  <CategoryIcon category={category.title} />
                </div>

                <span className={styles.categoryTitle}>{category.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesPanel;
