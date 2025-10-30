import React from 'react';
import styles from './teen-mental-health.module.css';

const TeenMentalHealth = () => {
  return (
    <div className={styles.container}>
      <h1>Mental Health for Teens</h1>
      <p className={styles.intro}>
        Navigating your teenage years can be challenging, but you're not alone. 
        This page is a safe space for you to find advice, resources, and support 
        for your mental well-being.
      </p>

      <div className={styles.section}>
        <h2>Understanding Your Feelings</h2>
        <p>
          It's normal to feel a mix of emotions. Learn to identify what you're feeling 
          and why. Whether it's stress from school, issues with friends, or pressure 
          to fit in, understanding your emotions is the first step to managing them.
        </p>
      </div>

      <div className={styles.section}>
        <h2>Coping Strategies</h2>
        <ul>
          <li><strong>Talk to someone you trust:</strong> A friend, family member, or school counselor.</li>
          <li><strong>Practice mindfulness:</strong> Try deep breathing exercises or meditation.</li>
          <li><strong>Stay active:</strong> Physical activity is a great way to boost your mood.</li>
          <li><strong>Limit social media:</strong> Take breaks to avoid comparison and negativity.</li>
          <li><strong>Get creative:</strong> Express yourself through writing, drawing, or music.</li>
        </ul>
      </div>

      <div className={styles.section}>
        <h2>When to Seek Help</h2>
        <p>
          If you're feeling overwhelmed, it's okay to ask for help. If your feelings 
          are persistent and affecting your daily life, consider talking to a mental 
          health professional. There are many resources available to support you.
        </p>
      </div>
    </div>
  );
};

export default TeenMentalHealth;
