"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  reasoning?: string | null;
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReasoning, setShowReasoning] = useState<Record<number, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message,
            reasoning: data.reasoning,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || "Sorry, something went wrong. Please try again.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleReasoning = (index: number) => {
    setShowReasoning((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        className="ai-chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        title="Ask ESG Hub AI"
      >
        {isOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="ai-chat-panel" role="dialog" aria-label="ESG Hub AI Assistant">
          {/* Header */}
          <div className="ai-chat-header">
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              ESG Hub AI
            </span>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                padding: "0.2em",
              }}
              aria-label="Close chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="ai-chat-messages">
            {messages.length === 0 && (
              <div style={{ color: "var(--color-text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "1.5rem 0.5rem" }}>
                <div style={{ marginBottom: "0.5rem", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                  Ask me about ESG topics
                </div>
                <div style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>
                  I can help with ESG standards, frameworks, climate risk, sustainability reporting, and more.
                  Powered by DeepSeek reasoning.
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`ai-msg ai-msg-${msg.role}`}>
                <div className="ai-msg-bubble">
                  {msg.role === "assistant" ? (
                    <div style={{ fontSize: "0.85rem", lineHeight: 1.6 }}>
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p style={{ margin: "0.3em 0" }}>{children}</p>,
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-link)" }}>
                              {children}
                            </a>
                          ),
                          strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
                          ul: ({ children }) => <ul style={{ paddingLeft: "1.2em", margin: "0.3em 0" }}>{children}</ul>,
                          ol: ({ children }) => <ol style={{ paddingLeft: "1.2em", margin: "0.3em 0" }}>{children}</ol>,
                          li: ({ children }) => <li style={{ margin: "0.15em 0" }}>{children}</li>,
                          code: ({ children }) => (
                            <code style={{ background: "var(--color-bg-secondary)", padding: "0.1em 0.3em", borderRadius: "2px", fontSize: "0.88em" }}>
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      {msg.reasoning && (
                        <div style={{ marginTop: "0.4rem" }}>
                          <button
                            onClick={() => toggleReasoning(i)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--color-text-muted)",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              fontFamily: "var(--font-heading)",
                              padding: "0.15em 0",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.2rem",
                            }}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              style={{
                                transform: showReasoning[i] ? "rotate(90deg)" : "rotate(0deg)",
                                transition: "transform 0.15s",
                              }}
                            >
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                            {showReasoning[i] ? "Hide" : "Show"} reasoning
                          </button>
                          {showReasoning[i] && (
                            <div
                              style={{
                                marginTop: "0.3rem",
                                padding: "0.5rem 0.6rem",
                                background: "var(--color-bg)",
                                borderRadius: "4px",
                                fontSize: "0.78rem",
                                color: "var(--color-text-muted)",
                                lineHeight: 1.5,
                                maxHeight: "200px",
                                overflowY: "auto",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {msg.reasoning}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span style={{ fontSize: "0.85rem" }}>{msg.content}</span>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-msg ai-msg-assistant">
                <div className="ai-msg-bubble ai-msg-thinking">
                  Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="ai-chat-input-area">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about ESG topics..."
              disabled={loading}
              maxLength={2000}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}>
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
