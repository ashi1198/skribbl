import { useState, useEffect, useRef } from "react";
import "./Chat.css";
import socket from "../../Socket";

interface Message {
  userId: string;
  username: string;
  message: string;
  type: "chat" | "correct" | "system";
}

interface ChatProps {
  isGameChat?: boolean;
  currentUserId: string;
  isDrawer?: boolean;
}

function Chat({
  isGameChat = false,
  currentUserId,
  isDrawer = false,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on("message", (data: Omit<Message, "type">) => {
      setMessages((prev) => [...prev, { ...data, type: "chat" }]);
    });

    socket.on("correctGuess", (data: { userId: string; username: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          userId: data.userId,
          username: data.username,
          message: `🎉 ${data.username} guessed correctly!`,
          type: "correct",
        },
      ]);
    });

    socket.on("chatMessage", (data: Omit<Message, "type">) => {
      setMessages((prev) => [...prev, { ...data, type: "chat" }]);
    });

    return () => {
      socket.off("message");
      socket.off("correctGuess");
      socket.off("chatMessage");
    };
  }, []);

  // auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    if (isGameChat) {
      socket.emit("guess", { userId: currentUserId, guess: input });
    } else {
      socket.emit("message", { message: input });
    }
    setInput("");
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.type}`}>
            {msg.type === "correct" ? (
              <span className="correct-msg">{msg.message}</span>
            ) : (
              <>
                <span className="chat-username">{msg.username}:</span>{" "}
                {msg.message}
              </>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          placeholder={
            isDrawer
              ? "You are drawing..."
              : isGameChat
                ? "Type your guess..."
                : "Say something..."
          }
          value={input}
          disabled={isDrawer}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend} disabled={isDrawer}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;
