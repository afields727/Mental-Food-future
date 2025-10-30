import React from 'react';
import styles from './error.module.css';

const Error = ({ message }) => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <h1 className={styles.errorTitle}>Error</h1>
        <p className={styles.errorMessage}>{message || 'An unexpected error occurred.'}</p>
      </div>
    </div>
  );
};

export default Error;
