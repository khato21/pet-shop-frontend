import { Link } from "react-router-dom";

import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.brandColumn}>
          <div className={styles.logo}>
            <svg
              className={styles.logoIcon}
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M20 34C17.5 34 14.5 31.5 12.5 29C10.5 26.5 9 24 9 21.5C9 18.5 11.5 17 14 17C16 17 18 18 20 20C22 18 24 17 26 17C28.5 17 31 18.5 31 21.5C31 24 29.5 26.5 27.5 29C25.5 31.5 22.5 34 20 34Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="11"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="20"
                cy="8"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle
                cx="28"
                cy="11"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>

            <div>
              <span className={styles.logoText}>WAGGY</span>
              <span className={styles.logoSubtitle}>Pet Shop</span>
            </div>
          </div>

          <p className={styles.brandDescription}>
            Subscribe to our newsletter to get updates about our grand offers.
          </p>

          <div className={styles.socials}>
            <a href="#" aria-label="Facebook" className={styles.socialIcon}>
              f
            </a>

            <a href="#" aria-label="Twitter" className={styles.socialIcon}>
              𝕏
            </a>

            <a href="#" aria-label="Pinterest" className={styles.socialIcon}>
              p
            </a>

            <a href="#" aria-label="Instagram" className={styles.socialIcon}>
              ◎
            </a>

            <a href="#" aria-label="YouTube" className={styles.socialIcon}>
              ▶
            </a>
          </div>
        </div>

        <div className={styles.linksColumn}>
          <h3 className={styles.columnTitle}>Quick Links</h3>

          <Link to="/" className={styles.footerLink}>
            Home
          </Link>

          <Link to="/about-us" className={styles.footerLink}>
            About Us
          </Link>

          <Link to="/animals" className={styles.footerLink}>
            Offers
          </Link>

          <Link to="/categories" className={styles.footerLink}>
            Services
          </Link>

          <Link to="/about-us" className={styles.footerLink}>
            Contact Us
          </Link>
        </div>

        <div className={styles.linksColumn}>
          <h3 className={styles.columnTitle}>Help Centre</h3>

          <Link to="/checkout" className={styles.footerLink}>
            Payments
          </Link>

          <Link to="/animals" className={styles.footerLink}>
            Shipping
          </Link>

          <Link to="/animals" className={styles.footerLink}>
            Product Returns
          </Link>

          <Link to="/about-us" className={styles.footerLink}>
            FAQs
          </Link>

          <Link to="/checkout" className={styles.footerLink}>
            Checkout
          </Link>
        </div>

        <div className={styles.newsletterColumn}>
          <h3 className={styles.columnTitle}>Our Newsletter</h3>

          <p className={styles.newsletterText}>
            Subscribe to our newsletter to get updates about our grand offers.
          </p>

          <form className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Enter your email address"
              className={styles.emailInput}
            />

            <button
              type="submit"
              className={styles.submitButton}
              aria-label="Subscribe"
            >
              →
            </button>
          </form>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>©2023 Waggy. All rights reserved.</p>

        <p className={styles.credit}>
          Template design by <span>TemplatesJungle</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
