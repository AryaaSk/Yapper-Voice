"use client";

import { useState, useEffect } from "react";
import { AgentInfo } from "./components/AgentList";
import AgentPicker from "./components/AgentPicker";
import CallInterface, { CallStatus } from "./components/CallInterface";
import WalletDisplay from "./components/WalletDisplay";
import { onBalanceChange } from "./lib/firebase-client";

export default function Home() {
  const [balance, setBalance] = useState<number | null>(null);
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");

  useEffect(() => {
    const unsubscribe = onBalanceChange((newBalance) => {
      setBalance(newBalance);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => {
        const list = data.agents ?? [];
        setAgents(list);
        if (list.length > 0) setSelectedAgent(list[0]);
      })
      .catch(() => {});
  }, []);

  if (balance === null || !selectedAgent) {
    return (
      <main className="bg-scene min-h-screen flex items-center justify-center">
        <div className="relative z-10">
          <div
            className="w-6 h-6 rounded-full spin-slow"
            style={{ border: "2px solid rgba(255,255,255,0.12)", borderTopColor: "#7c6df7" }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="bg-scene min-h-screen flex flex-col">
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#7c6df7" }}
          >
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2Z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-[15px] tracking-tight">yappervoice.com</span>
        </div>
        <WalletDisplay balance={balance} onBalanceUpdate={setBalance} costPerMinutePence={selectedAgent.costPerMinutePence} />
      </header>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-5 sm:px-8 pb-16">
        {/* Hero */}
        <div className="text-center mb-10 max-w-lg">
          <h1 className="text-[2.5rem] sm:text-5xl font-bold text-white leading-[1.1] tracking-tight mb-4">
            Talk to someone<br />who always gets it
          </h1>
          <p className="text-base sm:text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.50)" }}>
            Brainstorm ideas, think out loud, or just vent.
            <br className="hidden sm:block" />
            Your AI friends are always free to chat.
          </p>
        </div>

        {/* Agent picker */}
        <div className="mb-8">
          <AgentPicker
            agents={agents}
            selected={selectedAgent}
            onSelect={setSelectedAgent}
            disabled={callStatus !== "idle"}
          />
        </div>

        {/* Call interface */}
        <CallInterface
          key={selectedAgent.assistantId}
          agent={selectedAgent}
          balance={balance}
          onBalanceUpdate={setBalance}
          onStatusChange={setCallStatus}
        />
      </div>

      {/* Footer */}
      <footer
        className="relative z-10 text-center py-5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>yappervoice.com</p>
      </footer>
    </main>
  );
}
