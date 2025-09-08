// frontend/src/pages/Conversations.jsx
import { useEffect, useState } from "react";
import { listConversations } from "../api/chat";
import { useNavigate } from "react-router-dom";
import "../styles/Conversations.css"; // Import the stylesheet

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();
  const currentUser = localStorage.getItem("username"); // must be set at login!

  useEffect(() => {
    listConversations().then((res) => {
      const data = res.data.results || res.data;

      // deduplicate by id
      const unique = Object.values(
        data.reduce((acc, c) => {
          acc[c.id] = c;
          return acc;
        }, {})
      );

      setConversations(unique);
    });
  }, []);

  const getOtherParticipant = (participants) => {
    if (!participants) return "Unknown";
    const others = participants.filter((p) => p.username !== currentUser);
    return others.length > 0 ? others[0].username : "Unknown";
  };

  return (
    <div className="conversations-container">
      <div className="conversations-header">
        <h2 className="conversations-title">Messages</h2>
      </div>
      <ul className="conversations-list">
        {conversations.map((c) => (
          <li key={c.id} className="conversation-item">
            <button 
              className="conversation-button"
              onClick={() => navigate(`/chat/${c.id}`)}
            >
              <div className="participant-name">
                <div className="participant-avatar">
                  {getOtherParticipant(c.participants).charAt(0)}
                  <div className="online-indicator"></div>
                </div>
                <div className="participant-info">
                  <div className="participant-username">
                    {getOtherParticipant(c.participants)}
                  </div>
                  <div className="participant-status">Active now</div>
                </div>
              </div>
              <div className="conversation-arrow"></div>
            </button>
          </li>
        ))}
      </ul>
      {conversations.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <div className="empty-state-title">No conversations yet</div>
          <div className="empty-state-description">
            Start a conversation with sellers to see your messages here
          </div>
        </div>
      )}
    </div>
  );
}