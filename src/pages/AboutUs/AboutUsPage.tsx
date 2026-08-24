import styles from "./AboutUsPage.module.css";

const AboutUsPage = () => {
  return (
    <main className={styles.page}>
      <section className={styles.aboutUs}>
        <div className={styles.content}>
          <h1 className={styles.title}>About Us</h1>

          <p className={styles.description}>
            Find Your Perfect{" "}
            <span className={styles.descriptionAccent}>Companion</span>
          </p>

          <div className={styles.infoSection}>
            <div className={styles.infoBlock}>
              <h2 className={styles.subtitle}>Our Pet Shop</h2>

              <p className={styles.text}>
                Our goal is to make finding and choosing a pet simple and
                comfortable. You can explore different animals, learn more about
                them, and compare their availability and prices before making
                your choice.
              </p>
            </div>

            <div className={styles.infoBlock}>
              <h2 className={styles.subtitle}>What You Can Find</h2>

              <p className={styles.text}>
                Browse our animal categories to discover pets that may be the
                right fit for you and your family. Each animal page provides
                useful details, including its category, price, and current stock
                availability.
              </p>
            </div>

            <div className={styles.infoBlock}>
              <h2 className={styles.subtitle}>A Simple Shopping Experience</h2>

              <p className={styles.text}>
                Add your favorite animals to your wishlist, save the ones you
                are interested in, or add them directly to your cart when you
                are ready. We designed the shop to keep the experience clear,
                simple, and easy to navigate.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutUsPage;
