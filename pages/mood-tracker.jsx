import { useState, useEffect } from 'react';
import Link from 'next/link';
import MoodTracker from '../src/components/MoodTracker';
import Toast from '../src/components/Toast';
import Navigation from '../src/components/Navigation';
import ProgressChart from '../src/components/ProgressChart';

export default function MoodTrackerPage() {
    const [user, setUser] = useState(null);
    const [toast, setToast] = useState('');

    useEffect(() => {
        const raw = localStorage.getItem('mf_user');
        if (raw) {
            try { setUser(JSON.parse(raw)); } catch (e) { setUser(null); }
        }
    }, []);

    function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 4500) }

    return (
        <div className="container" style={{
            backgroundColor: '#f0f4f0',
            color: '#333',
            padding: '1rem',
            minHeight: '100vh'
        }}>
            <Navigation />
            <header style={{ textAlign: 'center', marginBottom: 18 }}>
                <h1>Mood Tracker</h1>
                <p className="note">Track your mood over the last 7 days.</p>
            </header>
            {toast && <Toast message={toast} onClose={() => setToast('')} />}
            <main>
                <div className="card" style={{marginBottom: '1rem'}}>
                    <MoodTracker user={user} onShowToast={showToast} />
                </div>
                <div className="card"><ProgressChart user={user} /></div>
            </main>
        </div>
    );
}