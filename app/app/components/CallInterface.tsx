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

  const costPerIntervalPence = Math.ceil(agent.costPerMinutePence / 6); // every 10s

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
        setError("Call ended - wallet balance depleted");
        return;
      }

      if (res.ok) {
        onBalanceUpdate(data.balance);
      }
    } catch {
      // Don't kill the call for a single failed deduction
    }
  }, [costPerIntervalPence, onBalanceUpdate]);

  const startCall = async () => {
    if (balance < MIN_BALANCE_TO_CALL) {
      setError(`Minimum balance of \u00A3${(MIN_BALANCE_TO_CALL / 100).toFixed(2)} required. Please top up.`);
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

        timerRef.current = setInterval(() => {
          setDuration((d) => d + 1);
        }, 1000);

        costRef.current = setInterval(() => {
          deductCost();
        }, 10000);
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
          setTranscript((prev) => [
            ...prev,
            { role: message.role, text: message.transcript },
          ]);
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
    } catch (err) {
      console.error("Failed to start call:", err);
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
    const header = `Call with ${agent.name}\n${new Date().toLocaleString()}\nDuration: ${formatDuration(duration)}\n${"─".repeat(40)}\n\n`;
    const body = transcript
      .map((msg) => `${msg.role === "user" ? "You" : agent.name}: ${msg.text}`)
      .join("\n\n");
    const blob = new Blob([header + body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${agent.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Call Button */}
      {status === "idle" ? (
        <button
          onClick={startCall}
          className="group relative w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
          <svg
            className="relative w-12 h-12 mx-auto text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </button>
      ) : status === "connecting" ? (
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      ) : (
        <button
          onClick={endCall}
          className="w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30 hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <svg
            className="w-12 h-12 mx-auto text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.516l2.257-1.13a1 1 0 00.502-1.21L10.228 3.684A1 1 0 009.28 3H5z"
            />
          </svg>
        </button>
      )}

      {/* Status text */}
      <div className="mt-6 text-center">
        {status === "idle" && (
          <p className="text-white/50 text-sm">Tap to call</p>
        )}
        {status === "connecting" && (
          <p className="text-yellow-400 text-sm animate-pulse">Connecting...</p>
        )}
        {status === "active" && (
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSpeaking ? "bg-green-400 animate-pulse" : "bg-white/30"
                }`}
              />
              <span className="text-white/70 text-sm">
                {isSpeaking ? "Speaking..." : "Listening..."}
              </span>
            </div>
            <p className="text-white/40 text-xs font-mono">{formatDuration(duration)}</p>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 max-w-sm">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      {/* Transcript */}
      <TranscriptView messages={transcript} />

      {/* Export button - show when idle with transcript */}
      {status === "idle" && transcript.length > 0 && (
        <button
          onClick={exportChat}
          className="mt-4 text-white/40 hover:text-white/70 text-sm cursor-pointer transition-colors flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export chat
        </button>
      )}
    </div>
  );
}
