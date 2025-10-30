import React from 'react';
import styles from './error.module.css';

const FiveHundred = () => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <h1 className={styles.errorTitle}>500 - Server Error</h1>
        <p className={styles.errorMessage}>There was an error on the server. Please try again later.</p>
      </div>
    </div>
  );
};

export default FiveHundred;
