"use client";

import { useState } from "react";
import type { AgentInfo } from "./AgentList";

interface AgentPickerProps {
  agents: AgentInfo[];
  selected: AgentInfo;
  onSelect: (agent: AgentInfo) => void;
  disabled?: boolean;
}

export default function AgentPicker({ agents, selected, onSelect, disabled }: AgentPickerProps) {
  const [open, setOpen] = useState(false);

  if (agents.length <= 1) {
    return (
      <p className="text-white/60 text-sm">
        {selected.name}
      </p>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-xl border transition-all ${
          disabled
            ? "border-white/5 text-white/30 cursor-not-allowed"
            : "border-white/10 text-white/60 hover:border-white/20 hover:text-white/80 cursor-pointer"
        }`}
      >
        <span className="font-medium text-white">{selected.name}</span>
        {!disabled && (
          <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden min-w-[280px]">
            {agents.map((agent) => (
              <button
                key={agent.assistantId}
                onClick={() => {
                  onSelect(agent);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-3 transition-colors cursor-pointer ${
                  agent.assistantId === selected.assistantId
                    ? "bg-indigo-500/15"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-white text-sm font-medium">{agent.name}</span>
                    <p className="text-white/40 text-xs mt-0.5">{agent.description}</p>
                  </div>
                  <span className="text-white/50 text-xs font-mono shrink-0">
                    {"\u00A3"}{(agent.costPerMinutePence / 100).toFixed(2)}/min
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
