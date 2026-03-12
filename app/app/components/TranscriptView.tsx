"use client";

import { useEffect, useRef } from "react";

export interface TranscriptMessage {
  role: "user" | "assistant";
  text: string;
}

interface TranscriptViewProps {
  messages: TranscriptMessage[];
}

export default function TranscriptView({ messages }: TranscriptViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) return null;

  return (
    <div className="w-full max-w-lg mx-auto mt-6">
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 max-h-64 overflow-y-auto">
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${
                  msg.role === "user"
                    ? "bg-indigo-500 text-white"
                    : "bg-white/10 text-white/80"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
