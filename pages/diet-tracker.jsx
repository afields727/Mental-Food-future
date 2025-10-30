import React, { useState, useEffect } from 'react';
import styles from './diet-tracker.module.css';

const DietTracker = () => {
  const [user, setUser] = useState(null);
  const [weekLog, setWeekLog] = useState({
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: '',
  });

  useEffect(() => {
    // In a real application, you would fetch user data
    // For now, we'll simulate a logged-in user
    setUser({ name: 'Alex' }); 
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWeekLog(prevLog => ({
      ...prevLog,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would save the data to a database
    console.log('Weekly Diet Log:', weekLog);
    alert('Your diet has been logged for the week!');
  };

  return (
    <div className={styles.container}>
      {user ? (
        <h1>Welcome back, {user.name}!</h1>
      ) : (
        <h1>Welcome, new user!</h1>
      )}
      <h2>Weekly Diet Tracker</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {Object.keys(weekLog).map(day => (
          <div key={day} className={styles.dayEntry}>
            <label htmlFor={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
            <textarea
              id={day}
              name={day}
              value={weekLog[day]}
              onChange={handleChange}
              placeholder={`What did you eat on ${day}?`}
            />
          </div>
        ))}
        <button type="submit" className={styles.submitButton}>Save Weekly Progress</button>
      </form>
    </div>
  );
};

export default DietTracker;
