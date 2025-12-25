import { useState, useEffect } from 'react';
import type { Message } from './types';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import './index.css';
const API_URL = import.meta.env.VITE_API_URL;
function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const savedSessionId = localStorage.getItem("chat_sessionId");
    if (savedSessionId) {
      setSessionId(savedSessionId);
      loadHistory(savedSessionId)
    } else {
      setMessages([
        {
          id: '1',
          sender: 'ai',
          content: 'Hello! I am Support Agent. How can I help you today?',
          timestamp: new Date().toISOString()
        }
      ])
    }
  }, [])

  const loadHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`${API_URL}/chat/history/${sessionId}`);
      const data = await response.json();
      const cleanMessages = data.map((msg: any) => ({
        id: msg.id.toString(),
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.created_at
      }));
      setMessages(cleanMessages);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  }

  const handleSendMessage = async (text: string) => {

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    try {

      const response = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId
        })
      });
      const data = await response.json();

      if (data.sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem("chat_sessionId", data.sessionId);
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: data.reply,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Error:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: "Sorry, I'm having trouble connecting to the server.Sorry for the inconvenience.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };
  return (
    <div className="chat-container">
      <header className="chat-header">
        🤖Support Agent
      </header>
      <MessageList messages={messages} isTyping={isTyping} />
      <MessageInput onSend={handleSendMessage} disabled={isTyping} />
    </div>
  );
}
export default App;