import React, { useState, useEffect } from "react";

type Mood = "low" | "stressed" | "okay" | "good" | null;

type Message = {
  id: string;
  sender: "user" | "app" | "system";
  text: string;
  ts: number;
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

// Small typing effect for app messages
function useTypewriter(text: string, speed = 20) {
  const [display, setDisplay] = useState("");
  useEffect(() => {
    let i = 0;
    setDisplay("");
    const id = setInterval(() => {
      i += 1;
      setDisplay(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return display;
}

export default function ChatBox({ initialUserAllergies, allowedRecipes }) {
  const [messages, setMessages] = useState([]);
  const [mood, setMood] = useState<Mood>(null);
  const [userText, setUserText] = useState("");
  const [pausedSuggestions, setPausedSuggestions] = useState(false);

  function push(msg: Omit<Message, "id" | "ts">) {
    setMessages((m) => [...m, { ...msg, id: uid(), ts: Date.now() }]);
  }

  // Start conversation with disclaimer and an open-ended question
  useEffect(() => {
    push({ sender: "system", text: "I provide friendly, non-clinical wellbeing and food guidance. Not a substitute for professional care. If you're in crisis, contact local emergency services." });
    push({ sender: "app", text: "Hi, I'm Tree Roots. How can I help you today? Feel free to talk about your day, ask for health advice, or look for recipes." });
  }, []);

  // If user reports crisis via typed message, detect keywords
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last || last.sender !== "user") return;
    const text = last.text.toLowerCase();
    const crisisKeywords = ["suicide", "kill myself", "die", "harm myself", "no reason to live", "want to die", "thoughts of suicide", "crisis"];
    if (crisisKeywords.some((k) => text.includes(k))) {
      // show urgent support and stop suggestions
      push({ sender: "system", text: "⚠️ You may need urgent support. Please contact a crisis hotline: [local/national number]." });
      setPausedSuggestions(true);
    }
  }, [messages]);

  function handleUserSend() {
    if (!userText.trim()) return;
    const currentText = userText;
    push({ sender: "user", text: currentText });
    const lt = userText.trim().toLowerCase();
    setUserText("");

    // Normal conversation flow — offer friendly follow-ups and food suggestions if asked
    const text = lt
    if (text.includes('ate') || text.includes('eat') || text.includes('food')) {
      // If allowedRecipes were provided, recommend one safe option
      if (allowedRecipes && allowedRecipes.length > 0) {
        const foundRecipes = allowedRecipes.filter(r => r.ingredients.some(ing => text.includes(ing.toLowerCase())) || text.includes(r.title.toLowerCase()));
        if (foundRecipes.length > 0) {
          const pick = foundRecipes[Math.floor(Math.random() * foundRecipes.length)];
          push({ sender: "app", text: `I found a safe recipe for you: ${pick.title}` });
          push({ sender: "app", text: JSON.stringify({ __recipe_card: true, recipe: pick }) });
          return;
        }
      } else {
        push({ sender: "app", text: "Thanks for sharing — tell me what you ate and I can suggest swaps or a gentle next step (drink water, short walk, breathe)." });
        return;
      }
    }

    // Fallback to a generic AI response for other messages
    (async () => {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...messages, { sender: 'user', text: currentText }] }),
        });
        if (!response.ok) throw new Error('API request failed');
        const data = await response.json();
        push({ sender: 'app', text: data.response });
      } catch (error) {
        push({ sender: 'app', text: "Sorry, I couldn't get a response. Please try again." });
      }
    })();
  }

  // Simple rendered typing effect for the last app message
  const lastAppMessage = [...messages].reverse().find((m) => m.sender === "app");
  const typed = useTypewriter(lastAppMessage ? lastAppMessage.text : "", 8);

  return (
    <div style={{
      border: "1px solid #a5d6a7", // Lighter green border
      padding: 12,
      borderRadius: 8,
      maxWidth: 640,
      backgroundColor: '#f1f8e9' // Very light green background
    }}>
      <div style={{
        height: 300, overflow: "auto", padding: 8, background: "#fff", border: "1px solid #e8f5e9", borderRadius: 4
      }}>
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#666" }}>{new Date(m.ts).toLocaleTimeString()}</div>
            {/* detect recipe card payloads encoded as JSON in the message text */}
            {(() => {
              let parsed = null
              try { parsed = JSON.parse(m.text) } catch (e) { parsed = null }
              if (parsed && parsed.__recipe_card && parsed.recipe) {
                const r = parsed.recipe
                return (
                  <div style={{ background: '#fffef6', padding: 14, borderRadius: 10, border: '1px solid #efe1b8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: 16 }}>{r.title}</strong>
                        <div style={{ fontSize: 12, color: '#666' }}>Recommended as safe for you</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="primary" style={{
                          backgroundColor: '#2e8b57',
                          color: 'white'
                        }}
                        onClick={() => {
                          try { const ev = new CustomEvent('mf_open_recipe', { detail: { id: r.id } }); window.dispatchEvent(ev) } catch (e) { /* ignore */ }
                        }}>Open in tracker</button>
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <strong style={{ fontSize: 13 }}>Ingredients</strong>
                      <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {(r.ingredients || []).map((ing, i) => (
                          <span key={i} style={{ background: '#e9f7e9', padding: '6px 8px', borderRadius: 999, fontSize: 13, border: '1px solid #d2f0d2' }}>{ing}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <strong style={{ fontSize: 13 }}>Steps</strong>
                      <ol style={{ marginTop: 8, paddingLeft: 18 }}>
                        {(r.steps || []).map((s, i) => (
                          <li key={i} style={{ marginBottom: 6, fontSize: 13 }}>{s}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )
              }
              return (
                <div style={{
                  background: m.sender === "user" ? "#c8e6c9" // User message green
                    : m.sender === "app" ? "#e8f5e9" // App message light green
                    : "#fff6e6", // System message
                  padding: 8, borderRadius: 6
                }}>
                  {m.sender === "app" && lastAppMessage && m.id === lastAppMessage.id ? (
                    <div>{typed}</div>
                  ) : (
                    <div>{m.text}</div>
                  )}
                </div>
              )
            })()}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 8 }}>
        {pausedSuggestions && (
          <div style={{ color: "#b00", marginBottom: 8 }}>
            ⚠️ You may need urgent support. Please contact a crisis hotline: [local/national number].
          </div>
        )}

        {!pausedSuggestions && (
          <div style={{ display: "flex" }}>
            <input
              className="input"
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              style={{ flex: 1, padding: 8, border: '1px solid #a5d6a7' }}
              placeholder="Type your message — be as short or as detailed as you like" />
            <button
              className="primary"
              onClick={handleUserSend}
              style={{ marginLeft: 8, backgroundColor: '#2e8b57', color: 'white' }}>
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
