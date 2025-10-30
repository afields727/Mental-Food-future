import { useState, useEffect } from 'react'

export default function MoodTracker({ user, onMoodChange, onShowToast }) {
  const [todayMood, setTodayMood] = useState(null)
  const [history, setHistory] = useState([])
  const [isImporting, setIsImporting] = useState(false);

  function keyFor(userId, dateStr) { return `mf_mood_${userId}_${dateStr}` }
  function noteKey(userId, dateStr) { return `mf_mood_note_${userId}_${dateStr}` }

  useEffect(() => {
    if (!user) { setTodayMood(null); setHistory([]); return }
    const now = new Date()
    const today = now.toISOString().slice(0,10)
    const raw = localStorage.getItem(keyFor(user.id, today))
    if (raw) setTodayMood(Number(raw))
    const days = []
    // load from today to the start of the current month
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayDate = now.getDate();
    for (let i = 0; i < todayDate; i++) {
      const d = new Date(year, month, todayDate - i);
      const ds = d.toISOString().slice(0, 10);
      const v = localStorage.getItem(keyFor(user.id, ds))
      days.push({ date: ds, value: v?Number(v):null })
    }
    // also load notes
    const withNotes = days.map(d => ({ ...d, note: localStorage.getItem(noteKey(user.id, d.date)) || '' }))
    setHistory(withNotes)
  }, [user])

  function saveMood(value) {
    if (!user) return onShowToast ? onShowToast('Please sign up or log in to save your mood') : console.warn('Please sign up or log in to save your mood')
    const now = new Date(); const today = now.toISOString().slice(0,10)
    try {
      localStorage.setItem(keyFor(user.id, today), String(value))
      setTodayMood(value)
      // update history
      const next = history.map(h => h.date === today ? { ...h, value } : h)
      setHistory(next)
      if (onMoodChange) onMoodChange(next)
    } catch (e) { /* ignore */ }
  }

  function saveNoteFor(date, text) {
    if (!user) return onShowToast ? onShowToast('Please sign up or log in to save notes') : console.warn('Please sign up or log in to save notes')
    try {
      localStorage.setItem(noteKey(user.id, date), text||'')
      setHistory(h => h.map(x => x.date===date ? { ...x, note: text } : x))
    } catch (e) { /* ignore */ }
  }

  function exportToCSV() {
    if (!history || history.length === 0) {
      return onShowToast ? onShowToast('No mood data to export.') : null;
    }

    const headers = ['date', 'mood', 'note'];
    // Reverse history to get chronological order for the CSV
    const data = [...history].reverse(); 

    // Function to escape CSV fields
    const escapeCSV = (field) => {
      if (field === null || field === undefined) return '';
      const str = String(field);
      // If the field contains a comma, a quote, or a newline, wrap it in double quotes
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`; // Escape double quotes by doubling them
      }
      return str;
    };

    const csvRows = [
      headers.join(','),
      ...data.map(row => [row.date, row.value, row.note].map(escapeCSV).join(','))
    ];

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-s-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mood-history-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function importFromCSV() {
    if (!user) {
      return onShowToast ? onShowToast('Please sign up or log in to import data.') : null;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';

    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;

      setIsImporting(true);

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csvString = event.target.result;
          const rows = csvString.trim().split('\n');
          const headers = rows.shift().trim().split(',');

          if (headers[0] !== 'date' || headers[1] !== 'mood' || headers[2] !== 'note') {
            throw new Error('Invalid CSV format. Headers must be "date,mood,note".');
          }

          // Robust CSV row parser to handle commas within quoted fields
          const parseCSVRow = (rowStr) => {
            const values = [];
            let currentVal = '';
            let inQuotes = false;
            for (let i = 0; i < rowStr.length; i++) {
              const char = rowStr[i];
              if (char === '"') {
                if (inQuotes && rowStr[i + 1] === '"') {
                  currentVal += '"'; // It's an escaped quote
                  i++; // Skip next quote
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (char === ',' && !inQuotes) {
                values.push(currentVal);
                currentVal = '';
              } else {
                currentVal += char;
              }
            }
            values.push(currentVal);
            return values;
          };

          const importedData = rows.map(row => {
            const values = parseCSVRow(row);
            return {
              date: values[0],
              value: values[1] ? Number(values[1]) : null,
              // Un-escape quotes and remove surrounding quotes if they exist
              note: values[2] ? values[2].replace(/""/g, '"') : ''
            };
          });

          // Merge with existing history and save to localStorage
          const updatedHistory = [...history];
          importedData.forEach(importedEntry => {
            if (importedEntry.date) {
              localStorage.setItem(keyFor(user.id, importedEntry.date), String(importedEntry.value || ''));
              localStorage.setItem(noteKey(user.id, importedEntry.date), importedEntry.note || '');
              
              const existingIndex = updatedHistory.findIndex(h => h.date === importedEntry.date);
              if (existingIndex > -1) {
                updatedHistory[existingIndex] = importedEntry;
              } else {
                updatedHistory.push(importedEntry);
              }
            }
          });
          setHistory(updatedHistory);
          onShowToast ? onShowToast(`${importedData.length} entries imported successfully!`) : null;
        } catch (error) {
          onShowToast ? onShowToast(`Import failed: ${error.message}`) : null;
        } finally {
          setIsImporting(false);
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }

  function handleClearAllData() {
    if (!user) {
      return onShowToast ? onShowToast('Please sign up or log in to manage data.') : null;
    }

    if (window.confirm('Are you sure you want to delete ALL of your mood data? This action cannot be undone.')) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(`mf_mood_${user.id}_`) || key.startsWith(`mf_mood_note_${user.id}_`))) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));

      setHistory([]);
      setTodayMood(null);
      onShowToast ? onShowToast('All mood data has been cleared.') : null;
    }
  }

  return (
    <div>
      <h4>Mood Tracker</h4>
      <p className="note">Tap a mood for today (1 low — 5 high)</p>
      <div style={{display:'flex', gap:8}}>
        {[1,2,3,4,5].map(v => (
          <button key={v} className={`moodBtn ${todayMood===v? 'selected':''}`} onClick={()=>saveMood(v)}>{['😞','😐','🙂','😊','😄'][v-1]}</button>
        ))}
      </div>
      <div style={{marginTop:8}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <small className="note">This Month's Mood History</small>
          <div style={{display: 'flex', gap: '0.5rem'}}>
            <button className="small" onClick={importFromCSV} disabled={isImporting} title="Import mood data from a CSV file">{isImporting ? 'Importing...' : 'Import'}</button>
            <button className="small" onClick={exportToCSV} disabled={isImporting} title="Export this month's mood data to a CSV file">Export</button>
            <button className="small" style={{color: '#a33'}} onClick={handleClearAllData} disabled={isImporting} title="Delete all mood history">Clear All</button>
          </div>
        </div>
        <div style={{marginTop:6}}>
          {history.map(h => (
            <div key={h.date} style={{display:'flex', flexDirection:'column', gap:6, padding:'6px 0', borderBottom:'1px solid #eef7ef'}}>
              <div style={{display:'flex', justifyContent:'space-between', gap:8}}>
                <div style={{color:'#065a2b'}}>{h.date}</div>
                <div>{h.value? ['😞','😐','🙂','😊','😄'][h.value-1] : '—'}</div>
              </div>
              <div>
                <textarea placeholder="Add a short note" value={h.note||''} onChange={e=> setHistory(prev => prev.map(p=> p.date===h.date ? { ...p, note: e.target.value } : p))} style={{width:'100%', minHeight:44, padding:8, borderRadius:6, border:'1px solid #e6f7ef'}} />
                <div style={{marginTop:6}}>
                  <button className="small" onClick={()=>saveNoteFor(h.date, h.note)}>Save note</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
