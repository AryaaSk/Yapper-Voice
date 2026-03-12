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
      <div
        className="inline-flex items-center gap-2 rounded-full px-4 py-2"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: "#7c6df7" }} />
        <span className="text-white text-sm font-medium">{selected.name}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        <div className="w-2 h-2 rounded-full" style={{ background: "#7c6df7" }} />
        <span className="font-medium text-white">{selected.name}</span>
        {!disabled && (
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            style={{ color: "rgba(255,255,255,0.5)" }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-50 w-72 rounded-2xl overflow-hidden"
            style={{
              background: "#1a1b27",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
            }}
          >
            {agents.map((agent, i) => (
              <button
                key={agent.assistantId}
                onClick={() => {
                  onSelect(agent);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 transition-colors cursor-pointer"
                style={{
                  borderBottom: i < agents.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  background: agent.assistantId === selected.assistantId ? "rgba(124,109,247,0.12)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (agent.assistantId !== selected.assistantId) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = agent.assistantId === selected.assistantId ? "rgba(124,109,247,0.12)" : "transparent";
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {agent.assistantId === selected.assistantId && (
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#7c6df7" }} />
                      )}
                      <span className="text-white text-sm font-medium truncate">{agent.name}</span>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{agent.description}</p>
                  </div>
                  <span className="text-xs font-mono shrink-0" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {"\u00A3"}{(agent.costPerMinutePence / 100).toFixed(2)}/m
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
