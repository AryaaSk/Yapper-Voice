"use client";

import { useState, useEffect } from "react";

export interface AgentInfo {
  assistantId: string;
  name: string;
  description: string;
  costPerMinutePence: number;
  metadata: {
    model: { provider: string; model: string } | null;
    voice: { provider: string; voiceId: string } | null;
    transcriber: { provider: string; model: string } | null;
    firstMessage: string | null;
  } | null;
}

interface AgentListProps {
  onSelect: (agent: AgentInfo) => void;
  selectedId: string | null;
}

export default function AgentList({ onSelect, selectedId }: AgentListProps) {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => {
        setAgents(data.agents ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <p className="text-white/40 text-center py-8">No agents configured.</p>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-3">
      {agents.map((agent) => (
        <button
          key={agent.assistantId}
          onClick={() => onSelect(agent)}
          className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
            selectedId === agent.assistantId
              ? "bg-indigo-500/15 border-indigo-500/50"
              : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-base">{agent.name}</h3>
              <p className="text-white/50 text-sm mt-0.5">{agent.description}</p>

              {agent.metadata && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {agent.metadata.model && (
                    <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">
                      {agent.metadata.model.provider}/{agent.metadata.model.model}
                    </span>
                  )}
                  {agent.metadata.voice && (
                    <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">
                      voice: {agent.metadata.voice.provider}
                    </span>
                  )}
                  {agent.metadata.transcriber && (
                    <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full">
                      stt: {agent.metadata.transcriber.provider}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="text-right shrink-0">
              <span className="text-white/70 text-sm font-mono">
                {"\u00A3"}{(agent.costPerMinutePence / 100).toFixed(2)}
              </span>
              <span className="text-white/40 text-xs block">/min</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
