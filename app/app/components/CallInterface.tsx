"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Vapi from "@vapi-ai/web";
import TranscriptView, { TranscriptMessage } from "./TranscriptView";
import { VAPI_PUBLIC_KEY } from "@/app/lib/vapi";
import { MIN_BALANCE_TO_CALL } from "@/app/lib/agents";
import type { AgentInfo } from "./AgentList";

export type CallStatus = "idle" | "connecting" | "active";

interface CallInterfaceProps {
  agent: AgentInfo;
  balance: number;
  onBalanceUpdate: (newBalance: number) => void;
  onStatusChange?: (status: CallStatus) => void;
}

export default function CallInterface({ agent, balance, onBalanceUpdate, onStatusChange }: CallInterfaceProps) {
  const [status, _setStatus] = useState<CallStatus>("idle");
  const setStatus = (s: CallStatus) => { _setStatus(s); onStatusChange?.(s); };
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const vapiRef = useRef<Vapi | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const costRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (costRef.current) clearInterval(costRef.current);
    };
  }, []);

  const costPerIntervalPence = Math.ceil(agent.costPerMinutePence / 6);

  const deductCost = useCallback(async () => {
    try {
      const res = await fetch("/api/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountPence: costPerIntervalPence }),
      });
      const data = await res.json();
      if (res.status === 402) {
        onBalanceUpdate(data.balance ?? 0);
        endCall();
        setError("Call ended \u2014 wallet balance depleted");
        return;
      }
      if (res.ok) onBalanceUpdate(data.balance);
    } catch { /* ignore single failure */ }
  }, [costPerIntervalPence, onBalanceUpdate]);

  const startCall = async () => {
    if (balance < MIN_BALANCE_TO_CALL) {
      setError(`Top up at least \u00A3${(MIN_BALANCE_TO_CALL / 100).toFixed(2)} to start a call.`);
      return;
    }
    setError(null);
    setStatus("connecting");
    setTranscript([]);
    setDuration(0);

    try {
      const vapi = new Vapi(VAPI_PUBLIC_KEY);
      vapiRef.current = vapi;

      vapi.on("call-start", () => {
        setStatus("active");
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
        costRef.current = setInterval(() => deductCost(), 10000);
      });
      vapi.on("call-end", () => {
        setStatus("idle");
        setIsSpeaking(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (costRef.current) clearInterval(costRef.current);
      });
      vapi.on("speech-start", () => setIsSpeaking(true));
      vapi.on("speech-end", () => setIsSpeaking(false));
      vapi.on("message", (message: any) => {
        if (message.type === "transcript" && message.transcriptType === "final") {
          setTranscript((prev) => [...prev, { role: message.role, text: message.transcript }]);
        }
      });
      vapi.on("error", (err: any) => {
        console.error("Vapi error:", err);
        setError("Connection error. Please try again.");
        setStatus("idle");
        if (timerRef.current) clearInterval(timerRef.current);
        if (costRef.current) clearInterval(costRef.current);
      });

      await vapi.start(agent.assistantId);
    } catch {
      setError("Failed to connect. Please try again.");
      setStatus("idle");
    }
  };

  const endCall = () => {
    if (vapiRef.current) vapiRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    if (costRef.current) clearInterval(costRef.current);
    setStatus("idle");
    setIsSpeaking(false);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const exportChat = () => {
    const header = `Call with ${agent.name} \u2014 Yapper Voice\n${new Date().toLocaleString()}\nDuration: ${formatDuration(duration)}\n${"─".repeat(40)}\n\n`;
    const body = transcript.map((msg) => `${msg.role === "user" ? "You" : agent.name}: ${msg.text}`).join("\n\n");
    const blob = new Blob([header + body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yapper-${agent.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Call button area */}
      <div className="relative flex items-center justify-center">
        {status === "idle" ? (
          <div className="relative">
            {/* Outer breathing ring */}
            <div
              className="absolute inset-[-12px] rounded-full ring-breathe"
              style={{ border: "1px solid rgba(124,109,247,0.3)" }}
            />
            <button
              onClick={startCall}
              className="call-glow relative w-[120px] h-[120px] rounded-full transition-transform duration-200 hover:scale-[1.04] active:scale-95 cursor-pointer"
              style={{ background: "linear-gradient(to bottom, #9b8fff, #7c6df7)" }}
            >
              <svg className="w-10 h-10 mx-auto text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
          </div>
        ) : status === "connecting" ? (
          <div className="relative w-[120px] h-[120px] flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full spin-slow"
              style={{ border: "2px solid rgba(124,109,247,0.15)", borderTopColor: "#7c6df7" }}
            />
            <div className="w-5 h-5 rounded-full" style={{ background: "#7c6df7" }} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {/* Audio visualiser */}
            <div className="flex items-end gap-[3px] h-7">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="audio-bar"
                  style={{
                    animationDelay: `${i * 0.12}s`,
                    opacity: isSpeaking ? 1 : 0.2,
                    transition: "opacity 0.3s",
                  }}
                />
              ))}
            </div>

            {/* Timer */}
            <span className="text-white text-3xl font-semibold tabular-nums tracking-tight">
              {formatDuration(duration)}
            </span>

            {/* End call */}
            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full hover:brightness-110 transition-all cursor-pointer flex items-center justify-center"
              style={{ background: "#f87171", boxShadow: "0 8px 24px rgba(248,113,113,0.25)" }}
            >
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.516l2.257-1.13a1 1 0 00.502-1.21L10.228 3.684A1 1 0 009.28 3H5z" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Status label */}
      <div className="mt-5 text-center h-6">
        {status === "idle" && transcript.length === 0 && (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.50)" }}>Tap to start a conversation</p>
        )}
        {status === "connecting" && (
          <p className="text-sm" style={{ color: "#9b8fff" }}>Connecting...</p>
        )}
        {status === "active" && (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.50)" }}>
            {isSpeaking ? "Speaking..." : "Listening..."}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="mt-4 rounded-xl px-4 py-2.5 max-w-sm"
          style={{
            background: "rgba(248,113,113,0.1)",
            border: "1px solid rgba(248,113,113,0.25)",
          }}
        >
          <p className="text-sm text-center" style={{ color: "#f87171" }}>{error}</p>
        </div>
      )}

      {/* Transcript */}
      <TranscriptView messages={transcript} />

      {/* Export */}
      {status === "idle" && transcript.length > 0 && (
        <button
          onClick={exportChat}
          className="mt-3 flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
          style={{ color: "rgba(255,255,255,0.45)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export transcript
        </button>
      )}
    </div>
  );
}
