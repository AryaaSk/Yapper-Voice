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
    <div className="w-full max-w-md mx-auto mt-8">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "10px 16px" }}>
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.45)" }}>
            Transcript
          </span>
        </div>
        <div className="p-4 max-h-56 overflow-y-auto custom-scrollbar space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] px-3.5 py-2 text-[13px] leading-relaxed"
                style={
                  msg.role === "user"
                    ? { background: "#7c6df7", color: "#fff", borderRadius: "16px 16px 6px 16px" }
                    : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.72)", borderRadius: "16px 16px 16px 6px" }
                }
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
