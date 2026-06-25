import { useState } from "react";
import API from "../services/api";

function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm CrowdGuard AI. Ask me anything about incidents." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await API.post("/ai/ask", { question: input });
      setMessages((prev) => [...prev, { role: "bot", text: response.data.answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-4 w-80 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 flex justify-between items-center">
            <span className="text-white font-bold">🤖 CrowdGuard AI</span>
            <button onClick={() => setOpen(false)} className="text-white text-xl">×</button>
          </div>
          <div className="flex flex-col gap-3 p-4 h-72 overflow-y-auto">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-3 py-2 rounded-xl text-sm max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-purple-600 text-white"
                    : "bg-slate-700 text-slate-200"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-400 px-3 py-2 rounded-xl text-sm">Thinking...</div>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-slate-700 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask something..."
              className="flex-1 px-3 py-2 bg-slate-700 text-white rounded-lg text-sm focus:outline-none focus:border-purple-500 border border-slate-600"
            />
            <button
              onClick={sendMessage}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-2xl shadow-lg hover:scale-110 transition-transform"
      >
        🤖
      </button>
    </div>
  );
}

export default ChatBot;
