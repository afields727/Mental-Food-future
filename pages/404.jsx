import React from 'react';
import Link from 'next/link';
import styles from './error.module.css';

const FourOhFour = () => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <h1 className={styles.errorTitle}>404 - Page Not Found</h1>
        <p className={styles.errorMessage}>The page you are looking for does not exist.</p>
        <Link href="/" legacyBehavior>
          <a className={styles.homeLink}>Go back to Home</a>
        </Link>
      </div>
    </div>
  );
};

export default FourOhFour;
