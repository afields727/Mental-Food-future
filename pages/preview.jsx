import React from 'react';

export default function Preview() {
  return (
    <div style={{padding: 20}}>
      <header className="nav">
        <h2 className="moving-text">Mental Food — Preview</h2>
      </header>

      <main style={{display: 'flex', gap: 24, alignItems: 'center', marginTop: 20}}>
        <section>
          <div className="avatar">
            <img src="/logo192.png" alt="avatar" />
          </div>
        </section>

        <section>
          <h3>Demo items</h3>
          <ul className="bullet-text">
            <li>🍎 Apple</li>
            <li>🥦 Broccoli</li>
            <li>🍞 Bread</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
