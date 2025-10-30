import React from 'react';
import styles from './mental-art.module.css';

// Placeholder data for art pieces
const artPieces = [
  {
    id: 1,
    title: 'Serenity',
    artist: 'A.I. Artist',
    imageUrl: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'A calming image to soothe the mind.',
  },
  {
    id: 2,
    title: 'Flow State',
    artist: 'A.I. Artist',
    imageUrl: 'https://images.unsplash.com/photo-1542281286-9e0e162736d1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Let your thoughts drift away like a flowing river.',
  },
  {
    id: 3,
    title: 'Mindful Moment',
    artist: 'A.I. Artist',
    imageUrl: 'https://images.unsplash.com/photo-1484591974057-265bb767ef71?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'A reminder to stay present and mindful.',
  },
];

const MentalArt = () => {
  return (
    <div className={styles.container}>
      <h1>Mental Art Gallery</h1>
      <p className={styles.intro}>
        A collection of art to inspire peace, mindfulness, and self-reflection. 
        Take a moment to breathe and enjoy.
      </p>
      <div className={styles.gallery}>
        {artPieces.map(art => (
          <div key={art.id} className={styles.artPiece}>
            <img src={art.imageUrl} alt={art.title} />
            <h3>{art.title}</h3>
            <p><em>{art.artist}</em></p>
            <p>{art.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MentalArt;
