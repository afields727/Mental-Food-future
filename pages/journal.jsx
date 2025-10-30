import { useState, useEffect } from 'react';
import Navigation from '../src/components/Navigation';

export default function JournalPage() {
    const [user, setUser] = useState(null);
    const [entries, setEntries] = useState([]);
    const [currentEntry, setCurrentEntry] = useState('');
    const [currentTags, setCurrentTags] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState('');
    const [editTags, setEditTags] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState('newest'); // 'newest' or 'oldest'

    // Load user from local storage
    useEffect(() => {
        const rawUser = localStorage.getItem('mf_user');
        if (rawUser) {
            try { setUser(JSON.parse(rawUser)); } catch (e) { console.error("Failed to parse user data"); }
        }
    }, []);

    // Load journal entries for the current user
    useEffect(() => {
        if (!user) return;
        const rawEntries = localStorage.getItem(`mf_journal_${user.id}`);
        if (rawEntries) {
            try { setEntries(JSON.parse(rawEntries)); } catch (e) { console.error("Failed to parse journal entries"); }
        }
    }, [user]);

    const handleSaveEntry = () => {
        if (!currentEntry.trim() || !user) return;
        const tags = currentTags.split(',').map(tag => tag.trim()).filter(tag => tag);
        const newEntry = { id: Date.now(), text: currentEntry, date: new Date().toISOString(), tags };
        const updatedEntries = [newEntry, ...entries];
        setEntries(updatedEntries);
        localStorage.setItem(`mf_journal_${user.id}`, JSON.stringify(updatedEntries));
        setCurrentEntry('');
        setCurrentTags('');
    };

    const handleDeleteEntry = (id) => {
        // Ask for confirmation before deleting
        if (!window.confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
            return; // Stop if the user clicks "Cancel"
        }
        if (!user) return;
        const updatedEntries = entries.filter(entry => entry.id !== id);
        setEntries(updatedEntries);
        localStorage.setItem(`mf_journal_${user.id}`, JSON.stringify(updatedEntries));
    };

    const handleStartEdit = (entry) => {
        setEditingId(entry.id);
        setEditText(entry.text);
        setEditTags(entry.tags ? entry.tags.join(', ') : '');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditText('');
        setEditTags('');
    };

    const handleSaveEdit = (id) => {
        if (!editText.trim() || !user) return;
        const tags = editTags.split(',').map(tag => tag.trim()).filter(tag => tag);
        const updatedEntries = entries.map(entry =>
            entry.id === id ? { ...entry, text: editText, date: new Date().toISOString(), tags } : entry
        );
        setEntries(updatedEntries);
        localStorage.setItem(`mf_journal_${user.id}`, JSON.stringify(updatedEntries));
        handleCancelEdit();
    };

    const filteredEntries = entries.filter(entry => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const textMatch = entry.text.toLowerCase().includes(lowerCaseQuery);
        const tagMatch = entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery));
        return textMatch || tagMatch;
    });

    const sortedAndFilteredEntries = filteredEntries.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (sortOrder === 'newest') {
            return dateB - dateA;
        }
        return dateA - dateB;
    });

    return (
        <div className="container" style={{
            backgroundColor: '#f0f4f0',
            color: '#333',
            padding: '1rem',
            minHeight: '100vh'
        }}>
            <Navigation />
            <header style={{ textAlign: 'center', marginBottom: 18 }}>
                <h1>Journal</h1>
                <p className="note">A private space for your thoughts and reflections.</p>
            </header>
            <main>
                <div className="card">
                    <h3>New Entry</h3>
                    <textarea
                        className="input"
                        style={{ width: '100%', minHeight: '200px', marginTop: '1rem', resize: 'vertical' }}
                        placeholder="What's on your mind today?"
                        value={currentEntry}
                        onChange={(e) => setCurrentEntry(e.target.value)}
                    ></textarea>
                    <input
                        type="text"
                        className="input"
                        style={{ width: '100%', marginTop: '0.5rem' }}
                        placeholder="Tags (comma-separated)"
                        value={currentTags}
                        onChange={(e) => setCurrentTags(e.target.value)}
                    />
                    <button
                        className="primary"
                        style={{ marginTop: '1rem', backgroundColor: '#2e8b57', color: 'white' }}
                        onClick={handleSaveEntry}
                    >
                        Save Entry
                    </button>
                </div>

                <div className="card" style={{marginTop: '1rem'}}>
                    <h3>Past Entries</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
                        <input
                            type="text"
                            className="input"
                            placeholder="Search entries..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button
                            className="small"
                            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                        >
                            Sort: {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                        </button>
                    </div>
                    {entries.length > 0 && sortedAndFilteredEntries.length === 0 ? (
                        <p className="note">No entries match your search.</p>
                    ) : sortedAndFilteredEntries.length === 0 ? (
                        <p className="note">Your saved journal entries will appear here.</p>
                    ) : (
                        sortedAndFilteredEntries.map(entry => (
                            editingId === entry.id ? (
                                <div key={entry.id} style={{borderBottom: '1px solid #eee', padding: '1rem 0'}}>
                                    <textarea
                                        className="input"
                                        style={{ width: '100%', minHeight: '100px', resize: 'vertical' }}
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                    ></textarea>
                                    <input
                                        type="text"
                                        className="input"
                                        style={{ width: '100%', marginTop: '0.5rem' }}
                                        placeholder="Tags (comma-separated)"
                                        value={editTags}
                                        onChange={(e) => setEditTags(e.target.value)}
                                    />
                                    <div style={{marginTop: '0.5rem'}}>
                                        <button className="primary small" style={{backgroundColor: '#2e8b57', color: 'white'}} onClick={() => handleSaveEdit(entry.id)}>Save</button>
                                        <button className="small" style={{marginLeft: '0.5rem'}} onClick={handleCancelEdit}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <div key={entry.id} style={{borderBottom: '1px solid #eee', padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                    <div style={{flex: 1}}>
                                        <p style={{whiteSpace: 'pre-wrap', margin: 0}}>{entry.text}</p>
                                        {entry.tags && entry.tags.length > 0 && (
                                            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                {entry.tags.map(tag => (
                                                    <span key={tag} className="pillBtn small" style={{cursor: 'pointer', backgroundColor: '#e0e0e0'}} onClick={() => setSearchQuery(tag)}>{tag}</span>
                                                ))}
                                            </div>
                                        )}
                                        <small className="note">{new Date(entry.date).toLocaleString()}</small>
                                    </div>
                                    <div style={{display: 'flex', gap: '0.5rem', marginLeft: '1rem'}}>
                                        <button
                                            className="small"
                                            onClick={() => handleStartEdit(entry)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="small"
                                            style={{ color: '#a33', border: '1px solid #fdd', background: '#fff6f6' }}
                                            onClick={() => handleDeleteEntry(entry.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}