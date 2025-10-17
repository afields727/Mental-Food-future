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
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);
  const [lastSuggestions, setLastSuggestions] = useState<string[]>([]);
  const [pausedSuggestions, setPausedSuggestions] = useState(false);

  function push(msg: Omit<Message, "id" | "ts">) {
    setMessages((m) => [...m, { ...msg, id: uid(), ts: Date.now() }]);
  }

  // Start conversation with disclaimer and mood question
  useEffect(() => {
    // Bot introduces itself as Tree roots
    push({ sender: "system", text: "Tree roots here — I provide friendly, non-clinical wellbeing and food guidance. Not a substitute for professional care. If you're in crisis, contact local emergency services." });
    push({ sender: "app", text: "Hi — how are you feeling today? Options: Low mood / Stressed / Okay / Good\n(Select one or type a short reply)" });
  }, []);

  // Handle mood selection
  function handleMoodSelection(choice: Mood) {
    setMood(choice);
    if (choice === "low") {
      push({ sender: "user", text: "Low mood" });
      // safe suggestions for low mood
      const suggestions = ["Try a short walk or light exercise (10-20 minutes)", "Listen to uplifting or calming music", "Reach out to a friend or family member and say you need a quick chat"];
      setLastSuggestions(suggestions);
      push({ sender: "app", text: "Here are a few gentle suggestions:\n- " + suggestions.join("\n- ") });
      push({ sender: "app", text: "How does this sound? Tell me what you'd like to try, or say 'no' and I'll offer other options." });
      setAwaitingConfirm(true);
    } else if (choice === "stressed") {
      push({ sender: "user", text: "Stressed" });
      const suggestions = ["Try a 4-4-4 breathing exercise (inhale 4s, hold 4s, exhale 4s)", "Do 5 minutes of journaling about what's on your mind", "Try gentle neck and shoulder stretches"];
      setLastSuggestions(suggestions);
      push({ sender: "app", text: "Try one of these stress-relief options:\n- " + suggestions.join("\n- ") });
      push({ sender: "app", text: "Tell me what might work for you or say 'no' and I'll suggest alternatives." });
      setAwaitingConfirm(true);
    } else if (choice === "okay") {
      push({ sender: "user", text: "Okay" });
      const suggestions = ["Keep up routines you enjoy", "Try a brief mindfulness or breathing practice (3-5 minutes)", "Write down 3 things you're grateful for today"];
      setLastSuggestions(suggestions);
      push({ sender: "app", text: "Nice — some ideas to maintain wellbeing:\n- " + suggestions.join("\n- ") });
      push({ sender: "app", text: "Would any of these work for you? Reply with the one you'd like to try or 'no' for alternatives." });
      setAwaitingConfirm(true);
    } else if (choice === "good") {
      push({ sender: "user", text: "Good" });
      const suggestions = ["Maintain routines that work for you", "Consider a short gratitude practice", "Share something positive with a friend"];
      setLastSuggestions(suggestions);
      push({ sender: "app", text: "Great — ways to keep momentum:\n- " + suggestions.join("\n- ") });
      push({ sender: "app", text: "Pick one to try or say 'no' and I'll offer different ideas." });
      setAwaitingConfirm(true);
    }
  }

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
    push({ sender: "user", text: userText });
    // If awaiting confirmation, treat yes/no responses
    const lt = userText.trim().toLowerCase();
    setUserText("");
    if (awaitingConfirm) {
      // Accept affirmative answers and common synonyms
      if (["yes","y","sure","ok","okay","works","that works","i will","i'll try","i can try","fine"].includes(lt)) {
        push({ sender: "app", text: "Great — glad these feel safe. Remember: You're not alone, and help is available if you need it." });
        setAwaitingConfirm(false);
      } else if (["no","n","nah","not really","don't","do not","nope"].some(tok => lt.startsWith(tok) || lt === tok)) {
        // Provide alternatives that try to match user's last message if they included a hint
        const hint = lt; // freeform hint like "can't do walking"
        const alternatives = lastSuggestions.map((s) => {
          if (hint.includes("walk") || hint.includes("exercise")) return "If exercise isn't comfortable, try breathing exercises, gentle stretching, or journaling";
          if (hint.includes("music")) return "If music isn't helpful, try a breathing exercise or guided imagery";
          if (s.toLowerCase().includes("exercise")) return "If exercise isn't comfortable, try journaling or a short guided meditation";
          if (s.toLowerCase().includes("music")) return "If music is not helpful, try a breathing exercise or calming imagery";
          return s;
        });
        setLastSuggestions(alternatives);
        push({ sender: "app", text: "Thanks — here are some alternatives:\n- " + alternatives.join("\n- ") });
        push({ sender: "app", text: "Do any of these feel better? Tell me which one or say another preference." });
      } else {
        // Treat freeform replies as clarifying choices: accept short clarifications as intent
        if (lt.length < 60) {
          push({ sender: "app", text: `Thanks — I'll take that as your preference: "${userText.trim()}". I'll adapt future suggestions.` });
          setAwaitingConfirm(false);
        } else {
          push({ sender: "app", text: "I didn't catch that. Tell me which option you'd like to try, or say 'no' for alternatives." });
        }
      }
      return;
    }

    // If mood not selected yet, allow typed mood selection
    if (!mood) {
      if (lt.includes("low")) return handleMoodSelection("low");
      if (lt.includes("stress") || lt.includes("stressed")) return handleMoodSelection("stressed");
      if (lt.includes("okay")) return handleMoodSelection("okay");
      if (lt.includes("good")) return handleMoodSelection("good");
      // otherwise echo
      push({ sender: "app", text: "Thanks — I heard: " + userText });
      return;
    }

    // Normal conversation flow — offer friendly follow-ups and food suggestions if asked
    const text = lt
    if (text.includes('ate') || text.includes('eat') || text.includes('food')) {
      // If allowedRecipes were provided, recommend one safe option
      if (allowedRecipes && allowedRecipes.length > 0) {
        const pick = allowedRecipes[Math.floor(Math.random() * allowedRecipes.length)];
        // Push a message with a special card payload that the UI will render as a recipe card
        push({ sender: "app", text: `I found a safe recipe for you: ${pick.title}` });
        push({ sender: "app", text: JSON.stringify({ __recipe_card: true, recipe: pick }) });
      } else {
        push({ sender: "app", text: "Thanks for sharing — tell me what you ate and I can suggest swaps or a gentle next step (drink water, short walk, breathe)." });
      }
      return;
    }

    push({ sender: "app", text: "Thanks for sharing. If you'd like, tell me more or choose one of the previous options." });
  }

  // Simple rendered typing effect for the last app message
  const lastAppMessage = [...messages].reverse().find((m) => m.sender === "app");
  const typed = useTypewriter(lastAppMessage ? lastAppMessage.text : "", 8);

  return (
    <div style={{ border: "1px solid #ccc", padding: 12, borderRadius: 8, maxWidth: 640 }}>
      <div style={{ height: 300, overflow: "auto", padding: 8, background: "#fafafa" }}>
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
                        <button onClick={() => {
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
                <div style={{ background: m.sender === "user" ? "#daf1da" : m.sender === "app" ? "#fff" : "#fff6e6", padding: 8, borderRadius: 6 }}>
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
        {!mood && (
          <div style={{ marginBottom: 8 }}>
            <button onClick={() => handleMoodSelection("low")} style={{ marginRight: 6 }}>Low mood</button>
            <button onClick={() => handleMoodSelection("stressed")} style={{ marginRight: 6 }}>Stressed</button>
            <button onClick={() => handleMoodSelection("okay")} style={{ marginRight: 6 }}>Okay</button>
            <button onClick={() => handleMoodSelection("good")} style={{ marginRight: 6 }}>Good</button>
          </div>
        )}

        {pausedSuggestions && (
          <div style={{ color: "#b00", marginBottom: 8 }}>
            ⚠️ You may need urgent support. Please contact a crisis hotline: [local/national number].
          </div>
        )}

        {!pausedSuggestions && (
          <div style={{ display: "flex" }}>
            <input value={userText} onChange={(e) => setUserText(e.target.value)} style={{ flex: 1, padding: 8 }} placeholder="Type your message — be as short or as detailed as you like" />
            <button onClick={handleUserSend} style={{ marginLeft: 8 }}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
}
