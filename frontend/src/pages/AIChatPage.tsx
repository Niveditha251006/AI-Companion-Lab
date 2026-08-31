import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import "../styles/AIChatPage.css";

type ChatMessage = {
  id: number;
  user_id?: number;
  role: "user" | "assistant";
  message: string;
  created_at?: string;
};

const API_BASE_URL = "http://127.0.0.1:5000/api";

function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // =========================================
  // LOGGED-IN USER
  // =========================================

  const userId = localStorage.getItem("userId") || "";

  // =========================================
  // LOAD CHAT HISTORY
  // =========================================

  const loadChatHistory = async () => {
    if (!userId) {
      console.error("❌ User ID not found.");
      setLoadingHistory(false);
      return;
    }

    try {
      setLoadingHistory(true);

      const response = await fetch(
        `${API_BASE_URL}/ai-chat/${userId}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load chat history."
        );
      }

      setMessages(
        Array.isArray(data.messages)
          ? data.messages
          : []
      );
    } catch (error) {
      console.error(
        "❌ Load chat history error:",
        error
      );
    } finally {
      setLoadingHistory(false);
    }
  };

  // =========================================
  // LOAD HISTORY WHEN PAGE OPENS
  // =========================================

  useEffect(() => {
    loadChatHistory();
  }, [userId]);

  // =========================================
  // SEND MESSAGE
  // =========================================

  const sendMessage = async () => {
    const text = input.trim();

    if (!text) {
      return;
    }

    if (!userId) {
      alert(
        "❌ User ID not found. Please login again."
      );
      return;
    }

    try {
      setLoading(true);

      // -----------------------------------------
      // TEMPORARILY SHOW USER MESSAGE
      // -----------------------------------------

      const temporaryUserMessage: ChatMessage = {
        id: Date.now(),
        user_id: Number(userId),
        role: "user",
        message: text,
      };

      setMessages((previous) => [
        ...previous,
        temporaryUserMessage,
      ]);

      setInput("");

      // -----------------------------------------
      // SEND TO BACKEND
      // -----------------------------------------

      const response = await fetch(
        `${API_BASE_URL}/ai-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: Number(userId),
            message: text,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to get AI response."
        );
      }

      // -----------------------------------------
      // ADD AI RESPONSE
      // -----------------------------------------

      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        user_id: Number(userId),
        role: "assistant",
        message:
          data.reply ||
          "Sorry, I couldn't generate a response.",
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "❌ AI chat error:",
        error
      );

      alert(
        "❌ Unable to get AI response. Make sure Flask and Gemini API are running."
      );

      // Reload database history so temporary
      // messages do not remain incorrectly
      await loadChatHistory();
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // ENTER TO SEND
  // =========================================

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  // =========================================
  // CLEAR CHAT
  // =========================================

  const clearChat = async () => {
    if (!userId) {
      alert(
        "❌ User ID not found. Please login again."
      );
      return;
    }

    if (messages.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      "Clear your entire chat history permanently?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/ai-chat/${userId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to clear chat history."
        );
      }

      setMessages([]);

      alert(
        `🗑️ Chat history cleared. ${
          data.deleted ?? 0
        } messages deleted.`
      );
    } catch (error) {
      console.error(
        "❌ Clear chat error:",
        error
      );

      alert(
        "❌ Unable to clear chat history."
      );
    }
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="ai-chat-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="ai-chat-header">

        <div>
          <h1>🤖 AI Companion</h1>

          <p>
            Ask questions, learn concepts,
            brainstorm ideas, and get help.
          </p>
        </div>

        <div className="ai-chat-status">
          <span className="status-dot"></span>
          Online
        </div>

      </div>

      {/* =====================================
          CHAT CONTAINER
      ===================================== */}

      <div className="ai-chat-container">

        {/* ===================================
            MESSAGES
        =================================== */}

        <div className="ai-chat-messages">

          {loadingHistory ? (

            <div className="chat-loading">
              ⏳ Loading chat history...
            </div>

          ) : messages.length === 0 ? (

            <div className="chat-empty">

              <div className="message-avatar">
                🤖
              </div>

              <div className="message-content">

                <span className="message-role">
                  AI Companion
                </span>

                <p>
                  👋 Hi! I'm your AI Companion.
                  How can I help you today?
                </p>

              </div>

            </div>

          ) : (

            messages.map((message) => (

              <div
                key={message.id}
                className={`chat-message ${
                  message.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
              >

                <div className="message-avatar">
                  {message.role === "user"
                    ? "👤"
                    : "🤖"}
                </div>

                <div className="message-content">

                  <span className="message-role">
                    {message.role === "user"
                      ? "You"
                      : "AI Companion"}
                  </span>

                  <div className="message-text">

                    {message.role ===
                    "assistant" ? (

                      <ReactMarkdown>
                        {message.message}
                      </ReactMarkdown>

                    ) : (

                      <p>
                        {message.message}
                      </p>

                    )}

                  </div>

                </div>

              </div>

            ))

          )}

          {/* ===============================
              AI THINKING
          =============================== */}

          {loading && (

            <div className="chat-message assistant-message">

              <div className="message-avatar">
                🤖
              </div>

              <div className="message-content">

                <span className="message-role">
                  AI Companion
                </span>

                <p>
                  ⏳ Thinking...
                </p>

              </div>

            </div>

          )}

        </div>

        {/* =================================
            INPUT AREA
        ================================= */}

        <div className="ai-chat-input-area">

          <textarea
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI Companion anything..."
            rows={2}
            disabled={loading}
          />

          <button
            onClick={sendMessage}
            disabled={
              loading ||
              !input.trim()
            }
            title="Send message"
          >
            ➤
          </button>

        </div>

        {/* =================================
            FOOTER
        ================================= */}

        <div className="input-hint">
          Press Enter to send • Shift + Enter
          for a new line
        </div>

      </div>

      {/* =====================================
          CLEAR CHAT
      ===================================== */}
<div className="clear-chat-wrapper">

        <button
  className="clear-chat-button"
  onClick={clearChat}
  disabled={
    loading ||
    loadingHistory ||
    messages.length === 0
  }
>
  🗑️ Clear Chat
</button>

      </div>

    </div>
  );
}

export default AIChatPage;
