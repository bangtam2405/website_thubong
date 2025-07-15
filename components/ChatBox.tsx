'use client';

import React, { useState } from "react";

const pink = {
  main: "#ec4899", // hồng đậm
  light: "#fce7f3", // hồng nhạt nền
  bubble: "#f9a8d4", // hồng bong bóng
  text: "#be185d", // chữ hồng
};

const ChatBox = () => {
  const [messages, setMessages] = useState<{ from: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { from: "user", text: input }]);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { from: "ai", text: data.message }]);
    } catch {
      setMessages((prev) => [...prev, { from: "ai", text: "Xin lỗi, đã xảy ra lỗi." }]);
    }
    setInput("");
    setLoading(false);
  };

  return (
    <>
      {/* Floating chat button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: pink.main,
            borderRadius: "50%",
            width: 56,
            height: 56,
            boxShadow: "0 4px 16px rgba(236,72,153,0.18)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "box-shadow 0.2s",
          }}
          aria-label="Mở chat bot"
        >
          <span style={{ fontSize: 28, color: "#fff" }}>💬</span>
        </button>
      )}

      {/* Chat popup */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1001,
            width: 350,
            maxWidth: "95vw",
            height: 480,
            maxHeight: "80vh",
            background: pink.light,
            borderRadius: 18,
            boxShadow: "0 8px 32px rgba(236,72,153,0.22)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "fadeInUp 0.3s",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: pink.main,
              color: "#fff",
              padding: "14px 18px",
              fontWeight: 600,
              fontSize: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span>Chatbot Thú Bông</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 22,
                cursor: "pointer",
                marginLeft: 8,
              }}
              aria-label="Đóng chat bot"
            >
              ×
            </button>
          </div>

          {/* Chat content */}
          <div
            style={{
              flex: 1,
              padding: 16,
              background: pink.light,
              overflowY: "auto",
              fontSize: 15,
            }}
          >
            {messages.length === 0 && (
              <div style={{ color: pink.text, textAlign: "center", marginTop: 40 }}>
                Hỏi chatbot về chính sách, sản phẩm, hỗ trợ...
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} style={{ textAlign: msg.from === "user" ? "right" : "left", margin: "10px 0" }}>
                <span
                  style={{
                    display: "inline-block",
                    background: msg.from === "user" ? pink.bubble : "#fff",
                    color: msg.from === "user" ? pink.text : "#222",
                    padding: "9px 14px",
                    borderRadius: 16,
                    maxWidth: "80%",
                    wordBreak: "break-word",
                    boxShadow: msg.from === "user" ? "0 1px 4px #f9a8d4" : "0 1px 4px #e5e7eb",
                  }}
                >
                  {msg.text}
                </span>
              </div>
            ))}
            {loading && <div style={{ textAlign: "left", color: pink.text }}>Đang trả lời...</div>}
          </div>

          {/* Input */}
          <div
            style={{
              padding: 12,
              borderTop: "1px solid #f9a8d4",
              background: pink.light,
              display: "flex",
              gap: 8,
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Nhập câu hỏi..."
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 10,
                border: `1px solid ${pink.bubble}`,
                fontSize: 15,
                outline: "none",
                background: "#fff",
                color: pink.text,
              }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={{
                padding: "0 18px",
                background: pink.main,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 15,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.7 : 1,
                transition: "opacity 0.2s",
              }}
            >
              Gửi
            </button>
          </div>
        </div>
      )}
      {/* CSS animation */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default ChatBox; 