import { useState, useEffect } from 'react';

export default function ProgressChart({ user }) {
  const [moodData, setMoodData] = useState([]);

  useEffect(() => {
    if (!user) return;

    const data = [];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Load data for the current calendar month
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateKey = d.toISOString().slice(0, 10);
      const moodValue = localStorage.getItem(`mf_mood_${user.id}_${dateKey}`);
      data.push({
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: moodValue ? Number(moodValue) : null,
      });
    }
    setMoodData(data);
  }, [user]);

  return (
    <div>
      <h4>Monthly Mood Chart</h4>
      <div style={{ display: 'flex', height: '150px', border: '1px solid #eee', padding: '10px', gap: '2px', alignItems: 'flex-end' }}>
        {moodData.map((day, index) => (
          <div key={index} title={`${day.date}: Mood ${day.mood || 'N/A'}`} style={{ flex: 1, backgroundColor: '#a5d6a7', height: day.mood ? `${(day.mood / 5) * 100}%` : '0%', transition: 'height 0.3s' }}>
            {/* Bar element */}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666', marginTop: '4px' }}>
        <span>{moodData[0]?.date} (Start of month)</span>
        <span>{moodData[moodData.length - 1]?.date}</span>
      </div>
    </div>
  );
}