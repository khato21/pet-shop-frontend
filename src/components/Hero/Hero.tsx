import { Link } from "react-router-dom";

import heroBackground from "../../assets/hero-background.png";

import styles from "./Hero.module.css";

const Hero = () => {
  return (
    <section
      className={styles.hero}
      style={{ backgroundImage: `url(${heroBackground})` }}
    >
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.offer}>SAVE 10 - 20 % OFF</p>

          <h1 className={styles.title}>
            Best Destination
            <br />
            For <span>Your Pets</span>
          </h1>

          <Link to="/animals" className={styles.button}>
            SHOP NOW
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
