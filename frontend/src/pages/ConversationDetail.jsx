// frontend/src/pages/ConversationDetail.jsx
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getConversation,
  listMessages,
  sendMessage,
  markConversationRead,
} from "../api/chat";
import "../styles/ConversationDetail.css";

export default function ConversationDetail() {
  const { id } = useParams();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef(null); // ref for autoscroll

  const currentUser = localStorage.getItem("username"); // stored at login

  // Fetch conversation + messages on load
  useEffect(() => {
    getConversation(id).then((res) => setConversation(res.data));
    fetchMessages();
    markConversationRead(id);
  }, [id]);

  const fetchMessages = async () => {
    try {
      const res = await listMessages(id);
      const data = res.data.results || res.data;
      setMessages(data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    try {
      const res = await sendMessage(id, newMsg);
      setMessages((prev) => [...prev, res.data]);
      setNewMsg("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="conversation-container">
      {/* Header stays fixed at top */}
      <div className="conversation-header">
        {conversation ? (
          <h2 className="conversation-title">
            Chat with{" "}
            {conversation.participants
              .filter((p) => p.username !== currentUser)
              .map((p) => p.username)
              .join(", ")}
          </h2>
        ) : (
          <h2 className="conversation-title">Loading...</h2>
        )}
      </div>

      {/* Scrollable messages area */}
      <div className="messages-container">
        {messages.length > 0 ? (
          messages.map((m) => {
            const isMine = m.sender.username === currentUser;

            // Format time as "2:45 PM" (24h or 12h depending on locale)
            const formattedTime = new Date(m.created_at).toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            );

            return (
              <div
                key={m.id}
                className={`message-bubble ${isMine ? "mine" : "theirs"}`}
              >
                <div className="message-text">{m.content}</div>
                <div className="message-time">{formattedTime}</div>
              </div>
            );
          })
        ) : (
          <div className="empty-messages">💬 Start the conversation</div>
        )}

        {/* dummy div for autoscroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSend} className="message-form">
        <input
          className="message-input"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit" className="send-button" disabled={!newMsg.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
