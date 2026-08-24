import { Link } from "react-router-dom";

import type { Category } from "../../interfaces/category.interface";

import CategoryIcon from "../CategoryIcon/CategoryIcon";

import styles from "./CategoryCard.module.css";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  return (
    <article className={styles.card}>
      <Link to={`/categories/${category.id}`} className={styles.cardLink}>
        <div className={styles.visual}>
          <div className={styles.iconWrapper}>
            <CategoryIcon category={category.title} />
          </div>
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>{category.title}</h2>

          <p className={styles.description}>{category.description}</p>
        </div>
      </Link>
    </article>
  );
};

export default CategoryCard;
