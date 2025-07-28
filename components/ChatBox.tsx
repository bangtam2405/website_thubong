'use client';

import React, { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpRightAndDownLeftFromCenter, faDownLeftAndUpRightToCenter, faXmark, faList, faPaperPlane } from "@fortawesome/free-solid-svg-icons";

const pink = {
  main: "#ec4899", // hồng đậm
  light: "#fce7f3", // hồng nhạt nền
  bubble: "#f9a8d4", // hồng bong bóng
  text: "#be185d", // chữ hồng
};

const ChatBox = () => {
  const [messages, setMessages] = useState<{ from: "user" | "ai"; text: string; product?: { _id: string; name: string; image: string; price: number; rating: number } }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showQuickList, setShowQuickList] = useState(false);

  const quickQuestions = [
    "Làm sao để thiết kế thú bông riêng?",
    "Sản phẩm nào bán chạy nhất?",
    "Sản phẩm nào được đánh giá cao nhất?",
    "Cách đặt hàng và thanh toán?",
    "Shop có hỗ trợ gói quà không?",
    "Tôi muốn đổi trả sản phẩm thì làm sao?"
  ];

  const handleQuickQuestion = (q: string) => {
    setInput("");
    setMessages((prev) => [...prev, { from: "user", text: q }]);
    setLoading(true);
    fetch("http://localhost:5000/api/ai-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: q }),
    })
      .then(res => res.json())
      .then(data => setMessages((prev) => [...prev, { from: "ai", text: data.message, product: data.product }]))
      .catch(() => setMessages((prev) => [...prev, { from: "ai", text: "Xin lỗi, đã xảy ra lỗi." }]))
      .finally(() => setLoading(false));
  };

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
      // Nếu có product, lưu kèm product
      setMessages((prev) => [...prev, { from: "ai", text: data.message, product: data.product }]);
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
            width: expanded ? 600 : 350,
            maxWidth: expanded ? "98vw" : "95vw",
            height: expanded ? 700 : 480,
            maxHeight: expanded ? "95vh" : "80vh",
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
            <span>Chatbot Gấu Xinh</span>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button
                onClick={() => setExpanded(e => !e)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: 20,
                  cursor: "pointer",
                  marginRight: 2,
                  padding: 0,
                  width: 28,
                  height: 28,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                aria-label={expanded ? "Thu nhỏ chat" : "Phóng to chat"}
                title={expanded ? "Thu nhỏ" : "Phóng to"}
              >
                {expanded ? (
                  <FontAwesomeIcon icon={faDownLeftAndUpRightToCenter} style={{ fontSize: 18 }} />
                ) : (
                  <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} style={{ fontSize: 18 }} />
                )}
              </button>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#fff",
                  fontSize: 22,
                  cursor: "pointer",
                  marginLeft: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28
                }}
                aria-label="Đóng chat bot"
              >
                <FontAwesomeIcon icon={faXmark} style={{ fontSize: 22 }} />
              </button>
            </div>
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
                <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickQuestion(q)}
                      style={{
                        background: pink.main,
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "7px 14px",
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: "pointer",
                        margin: 0,
                        transition: "background 0.2s"
                      }}
                      disabled={loading}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} style={{ textAlign: msg.from === "user" ? "right" : "left", margin: "10px 0" }}>
                {msg.from === "ai" && msg.product ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      background: "#fff",
                      borderRadius: 16,
                      boxShadow: "0 2px 8px rgba(236,72,153,0.10)",
                      padding: 10,
                      maxWidth: 340,
                      minWidth: 220,
                      margin: "0 auto"
                    }}
                  >
                    <img
                      src={msg.product.image}
                      alt={msg.product.name}
                      style={{
                        width: 72,
                        height: 72,
                        objectFit: "cover",
                        borderRadius: 12,
                        flexShrink: 0,
                        background: "#f3f4f6",
                        border: "1px solid #fce7f3"
                      }}
                    />
                    <div style={{ flex: 1, marginLeft: 14, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ fontWeight: 700, color: pink.text, fontSize: 16, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {msg.product.name}
                      </div>
                      <div style={{ color: "#222", fontSize: 15, fontWeight: 600, marginBottom: 2 }}>
                        {msg.product.price.toLocaleString('vi-VN')}₫
                      </div>
                      {typeof msg.product.rating === 'number' && (
                        <div style={{ color: "#f59e42", fontSize: 13, marginBottom: 4, display: "flex", alignItems: "center", gap: 3 }}>
                          <span style={{ fontSize: 15 }}>⭐</span> {msg.product.rating}
                        </div>
                      )}
                      <Link
                        href={`/product/${msg.product._id}`}
                        target="_blank"
                        style={{
                          display: "block",
                          marginTop: 6,
                          background: pink.main,
                          color: "#fff",
                          borderRadius: 8,
                          padding: "7px 0",
                          fontWeight: 600,
                          fontSize: 14,
                          textDecoration: "none",
                          textAlign: "center",
                          width: "100%"
                        }}
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                ) : (
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
                    dangerouslySetInnerHTML={msg.from === "ai" ? { __html: msg.text } : undefined}
                  >{msg.from !== "ai" ? msg.text : null}</span>
                )}
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
              alignItems: "center"
            }}
          >
            {/* Icon list bên trái */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowQuickList(v => !v)}
                style={{
                  background: "#fff",
                  border: `1px solid ${pink.bubble}`,
                  borderRadius: 8,
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: pink.text,
                  fontSize: 18,
                  cursor: "pointer",
                  marginRight: 4
                }}
                aria-label="Câu hỏi gợi ý"
              >
                <FontAwesomeIcon icon={faList} />
              </button>
              {showQuickList && (
                <div style={{
                  position: "absolute",
                  left: 0,
                  bottom: 44,
                  background: "#fff",
                  border: `1px solid ${pink.bubble}`,
                  borderRadius: 10,
                  boxShadow: "0 4px 16px rgba(236,72,153,0.10)",
                  zIndex: 10,
                  minWidth: 220,
                  padding: 8,
                  transform: "translateY(-8px)",
                }}>
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setShowQuickList(false); handleQuickQuestion(q); }}
                      style={{
                        background: "none",
                        border: "none",
                        color: pink.text,
                        fontSize: 15,
                        textAlign: "left",
                        padding: "8px 0 8px 8px",
                        width: "100%",
                        borderRadius: 6,
                        cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                      onMouseDown={e => e.preventDefault()}
                      disabled={loading}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Nhập tin nhắn..."
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
                width: 36,
                height: 36,
                background: pink.main,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                opacity: loading || !input.trim() ? 0.7 : 1,
                transition: "opacity 0.2s"
              }}
              aria-label="Gửi tin nhắn"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
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