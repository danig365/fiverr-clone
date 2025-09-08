// frontend/src/api/chat.js
import API from "./api";

// Conversations
export const listConversations = () => API.get("chat/conversations/");
export const getConversation = (id) => API.get(`chat/conversations/${id}/`);
export const createConversation = (participants) =>
  API.post("chat/conversations/", { participants });
export const deleteConversation = (id) => API.delete(`chat/conversations/${id}/`);

// Messages
export const listMessages = (conversationId) =>
  API.get("chat/messages/", { params: { conversation: conversationId } });


export const sendMessage = (conversationId, content) =>
  API.post(`chat/conversations/${conversationId}/send_message/`, { content });

// Mark as read
export const markConversationRead = (conversationId) =>
  API.post(`chat/conversations/${conversationId}/mark_read/`);

// Unread counts
export const getUnreadCounts = () =>
  API.get("chat/conversations/unread_count/");

