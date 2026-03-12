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
      <main className="bg-mesh min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="bg-mesh min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-white font-bold text-lg">Smart Friend</h1>
        <WalletDisplay balance={balance} onBalanceUpdate={setBalance} />
      </header>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Call a Smart Friend
          </h2>
          <p className="text-white/50 text-lg max-w-md mx-auto mb-6">
            Always available. Talk through ideas, ask questions, or just chat.
          </p>

          {/* Agent picker */}
          <div className="flex justify-center">
            <AgentPicker
              agents={agents}
              selected={selectedAgent}
              onSelect={setSelectedAgent}
              disabled={callStatus !== "idle"}
            />
          </div>
        </div>

        <CallInterface
          key={selectedAgent.assistantId}
          agent={selectedAgent}
          balance={balance}
          onBalanceUpdate={setBalance}
          onStatusChange={setCallStatus}
        />
      </div>
    </main>
  );
}
