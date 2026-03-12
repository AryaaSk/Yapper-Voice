"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import CheckoutButton from "./CheckoutButton";

interface TopUpModalProps {
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
  costPerMinutePence?: number;
}

const PRESETS = [
  { pence: 100 },
  { pence: 500 },
  { pence: 1000 },
];

function formatMinutes(pence: number, costPerMin: number): string {
  const mins = Math.floor(pence / costPerMin);
  if (mins >= 60) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `~${h}h ${m}m` : `~${h}h`;
  }
  return `~${mins} min`;
}

export default function TopUpModal({ onClose, onSuccess, costPerMinutePence = 15 }: TopUpModalProps) {
  const [selectedPence, setSelectedPence] = useState(500);
  const [isCustom, setIsCustom] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const customPence = Math.round(parseFloat(customValue || "0") * 100);
  const activePence = isCustom ? customPence : selectedPence;
  const validAmount = activePence >= 50 && activePence <= 5000;

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />

      {/* Panel */}
      <div
        className="relative rounded-2xl p-6 w-full max-w-[380px] mx-4"
        style={{
          background: "#1a1b27",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06) inset",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-white text-lg font-semibold">Add funds</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
            style={{ background: "rgba(255,255,255,0.08)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          >
            <svg className="w-3.5 h-3.5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {status === "success" ? (
          <div className="text-center py-8">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: "rgba(52,211,153,0.12)" }}
            >
              <svg className="w-6 h-6" style={{ color: "#34d399" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-semibold">Payment successful</p>
            <p className="text-white/50 text-sm mt-1">Wallet has been topped up.</p>
          </div>
        ) : (
          <>
            {/* Presets */}
            <div className="grid grid-cols-3 gap-2.5 mb-3">
              {PRESETS.map((p) => {
                const selected = !isCustom && selectedPence === p.pence;
                return (
                  <button
                    key={p.pence}
                    onClick={() => { setSelectedPence(p.pence); setIsCustom(false); }}
                    className="py-3 rounded-xl transition-all cursor-pointer flex flex-col items-center gap-0.5"
                    style={
                      selected
                        ? {
                            background: "rgba(124,109,247,0.15)",
                            border: "1px solid rgba(124,109,247,0.6)",
                            boxShadow: "0 0 20px rgba(124,109,247,0.15)",
                          }
                        : {
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.10)",
                          }
                    }
                  >
                    <span className="font-semibold text-base" style={{ color: selected ? "#fff" : "rgba(255,255,255,0.6)" }}>
                      {"\u00A3"}{(p.pence / 100).toFixed(0)}
                    </span>
                    <span className="text-[11px]" style={{ color: selected ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.3)" }}>
                      {formatMinutes(p.pence, costPerMinutePence)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom amount */}
            <button
              onClick={() => setIsCustom(true)}
              className="w-full mb-4 rounded-xl transition-all cursor-pointer"
              style={
                isCustom
                  ? {
                      background: "rgba(124,109,247,0.15)",
                      border: "1px solid rgba(124,109,247,0.6)",
                      padding: "10px 14px",
                    }
                  : {
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      padding: "10px 14px",
                    }
              }
            >
              {isCustom ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-white font-semibold text-base">{"\u00A3"}</span>
                  <input
                    type="number"
                    min="0.50"
                    max="50"
                    step="0.50"
                    autoFocus
                    placeholder="0.00"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    className="flex-1 bg-transparent text-white text-base font-semibold outline-none placeholder-white/25 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  {customPence > 0 && (
                    <span className="text-[12px] shrink-0" style={{ color: "rgba(255,255,255,0.45)" }}>
                      {formatMinutes(customPence, costPerMinutePence)}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>Custom amount</span>
                </div>
              )}
            </button>

            {/* Checkout */}
            {validAmount ? (
              <CheckoutButton
                key={activePence}
                amountPence={activePence}
                onSuccess={(balance) => {
                  setStatus("success");
                  setTimeout(() => onSuccess(balance), 1000);
                }}
                onError={() => setStatus("error")}
              />
            ) : (
              <p className="text-center text-[13px] py-3" style={{ color: "rgba(255,255,255,0.3)" }}>
                {activePence > 0 && activePence < 50 ? "Minimum \u00A30.50" : activePence > 5000 ? "Maximum \u00A350.00" : "Select an amount to continue"}
              </p>
            )}

            {status === "error" && (
              <p className="text-sm text-center mt-3" style={{ color: "#f87171" }}>
                Payment failed. Please try again.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
