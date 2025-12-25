import { useEffect,useRef } from "react";
import type { Message } from "../types";

interface Props {
    messages: Message[];
    isTyping: boolean;
}

export const MessageList=({messages,isTyping}:Props)=>{
    const bottomRef = useRef<HTMLDivElement>(null);
     useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);
    
    return (
    <div className="message-list">
      {messages.map((msg) => (
        <div key={msg.id} className={`message-row ${msg.sender}`}>
          <div className="bubble">
            {msg.content}
          </div>
        </div>
      ))}
      
      {isTyping && (
        <div className="message-row ai">
          <div className="bubble typing">Agent is typing...</div>
        </div>
      )}
    </div>
  );
};