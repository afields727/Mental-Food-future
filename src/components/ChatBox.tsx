import React, { useState, useEffect } from "react";
import type { UserAllergy } from "../types";

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

export default function ChatBox({ initialUserAllergies }: { initialUserAllergies?: UserAllergy[] }) {
  const [messages, setMessages] = useState<Message[]>([]);
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
    push({ sender: "system", text: "This app provides general wellness information only. It is not a substitute for professional mental health care. If you are experiencing depression, anxiety, or a mental health crisis, please contact a licensed mental health provider or call your local emergency number immediately. How are you feeling today?", });
    push({ sender: "app", text: "Options: Low mood / Stressed / Okay / Good\n(Select one below)" });
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
      push({ sender: "app", text: "Are these suggestions comfortable and safe for you? (Yes / No)" });
      setAwaitingConfirm(true);
    } else if (choice === "stressed") {
      push({ sender: "user", text: "Stressed" });
      const suggestions = ["Try a 4-4-4 breathing exercise (inhale 4s, hold 4s, exhale 4s)", "Do 5 minutes of journaling about what's on your mind", "Try gentle neck and shoulder stretches"];
      setLastSuggestions(suggestions);
      push({ sender: "app", text: "Try one of these stress-relief options:\n- " + suggestions.join("\n- ") });
      push({ sender: "app", text: "Are these suggestions comfortable and safe for you? (Yes / No)" });
      setAwaitingConfirm(true);
    } else if (choice === "okay") {
      push({ sender: "user", text: "Okay" });
      const suggestions = ["Keep up routines you enjoy", "Try a brief mindfulness or breathing practice (3-5 minutes)", "Write down 3 things you're grateful for today"];
      setLastSuggestions(suggestions);
      push({ sender: "app", text: "Nice — some ideas to maintain wellbeing:\n- " + suggestions.join("\n- ") });
      push({ sender: "app", text: "Are these suggestions comfortable and safe for you? (Yes / No)" });
      setAwaitingConfirm(true);
    } else if (choice === "good") {
      push({ sender: "user", text: "Good" });
      const suggestions = ["Maintain routines that work for you", "Consider a short gratitude practice", "Share something positive with a friend"];
      setLastSuggestions(suggestions);
      push({ sender: "app", text: "Great — ways to keep momentum:\n- " + suggestions.join("\n- ") });
      push({ sender: "app", text: "Are these suggestions comfortable and safe for you? (Yes / No)" });
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
      if (lt === "yes" || lt === "y") {
        push({ sender: "app", text: "Great — glad these feel safe. Remember: You're not alone, and help is available if you need it." });
        setAwaitingConfirm(false);
      } else if (lt === "no" || lt === "n") {
        // swap alternatives — simple swap: replace exercise with journaling/meditation if present
        const alternatives = lastSuggestions.map((s) => {
          if (s.toLowerCase().includes("exercise")) return "If exercise isn't comfortable, try journaling or a short guided meditation";
          if (s.toLowerCase().includes("music")) return "If music is not helpful, try a breathing exercise or calming imagery";
          return s;
        });
        setLastSuggestions(alternatives);
        push({ sender: "app", text: "Thanks for letting me know. Here are alternative suggestions:\n- " + alternatives.join("\n- ") });
        push({ sender: "app", text: "Are these alternatives comfortable and safe for you? (Yes / No)" });
      } else {
        // if not yes/no, prompt again
        push({ sender: "app", text: "Please reply with Yes or No — are these suggestions comfortable and safe for you?" });
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

    // Normal conversation flow — in this prototype we'll echo and give a gentle prompt
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
            <div style={{ background: m.sender === "user" ? "#daf1da" : m.sender === "app" ? "#fff" : "#fff6e6", padding: 8, borderRadius: 6 }}>
              {m.sender === "app" && lastAppMessage && m.id === lastAppMessage.id ? (
                <div>{typed}</div>
              ) : (
                <div>{m.text}</div>
              )}
            </div>
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
            <input value={userText} onChange={(e) => setUserText(e.target.value)} style={{ flex: 1, padding: 8 }} placeholder="Type your message or reply Yes/No" />
            <button onClick={handleUserSend} style={{ marginLeft: 8 }}>Send</button>
          </div>
        )}
      </div>
    </div>
  );
}
