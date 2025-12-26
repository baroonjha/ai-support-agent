import React, { useState, useRef, useEffect } from 'react';
import { Send, ThumbsUp, ThumbsDown, Bot, User } from 'lucide-react';

// Types
interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
  feedback?: 'up' | 'down' | null;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "What is the return period?",
    "What are the shipping charges?",
    "What are your support hours?",
    "How can I track my order?"
  ];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const savedSessionId = localStorage.getItem("chat_sessionId");
    if (savedSessionId) {
      setSessionId(savedSessionId);
      loadHistory(savedSessionId);
    } else {
      setMessages([
        {
          id: '1',
          sender: 'ai',
          content: 'Hello! I am Support Agent. How can I help you today?',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, []);

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

      if (cleanMessages.length === 0) {
        setMessages([
          {
            id: '1',
            sender: 'ai',
            content: 'Hello! I am Support Agent. How can I help you today?',
            timestamp: new Date().toISOString()
          }
        ]);
      } else {
        setMessages(cleanMessages);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (text.trim() === '') return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
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
        content: "Sorry, I'm having trouble connecting to the server. Sorry for the inconvenience.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    handleSendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const handleFeedback = (messageId: string, feedbackType: 'up' | 'down') => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, feedback: feedbackType } : msg
      )
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-gray-800">🤖 Support Agent</h1>
        </div>
      </nav>

      <div className="flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col" style={{ height: '75vh', minHeight: '500px' }}>
            {/* Chat Messages main container */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto px-6 py-6 space-y-6"
            >
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-start space-x-3 animate-fade-in`}
                  >
                    {message.sender === 'ai' && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                        <Bot size={20} className="text-white" />
                      </div>
                    )}

                    <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'} max-w-xs md:max-w-md lg:max-w-lg`}>
                      <div
                        className={`px-4 py-3 rounded-2xl ${message.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                          }`}
                      >
                        <p className="text-sm md:text-base leading-relaxed">{message.content}</p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 px-1">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>

                    {message.sender === 'user' && (
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md">
                        <User size={20} className="text-white" />
                      </div>
                    )}
                  </div>
{/* feedback from user ,logic not implemented */}
                  {message.sender === 'ai' && (
                    <div className="flex justify-start mt-2 ml-14 space-x-2">
                      <button
                        onClick={() => handleFeedback(message.id, 'up')}
                        className={`p-1.5 rounded-full transition-colors ${message.feedback === 'up'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        aria-label="Thumbs up"
                      >
                        <ThumbsUp size={16} />
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id, 'down')}
                        className={`p-1.5 rounded-full transition-colors ${message.feedback === 'down'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        aria-label="Thumbs down"
                      >
                        <ThumbsDown size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start items-start space-x-3 animate-fade-in">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                    <Bot size={20} className="text-white" />
                  </div>
                  <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(question)}
                      className="px-3 py-1.5 text-xs md:text-sm bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors border border-gray-300 shadow-sm"
                    >
                      {question}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={isTyping}
                      className={`flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent text-gray-800 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${inputValue.length >= 500
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      aria-label="Message input"
                      maxLength={500}
                    />
                    <button
                      onClick={handleSend}
                      disabled={inputValue.trim() === '' || isTyping}
                      className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
                      aria-label="Send message"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                        {/* character limit is 500 */}
                  <div className="flex justify-between px-4 text-xs">
                    <span className={`transition-opacity duration-200 ${inputValue.length >= 500 ? 'text-red-500 opacity-100' : 'opacity-0'
                      }`}>
                      Maximum character limit reached
                    </span>
                    <span className={`${inputValue.length >= 500 ? 'text-red-500 font-medium' : 'text-gray-400'
                      }`}>
                      {inputValue.length}/500
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}