"use client";

import { useState } from "react";
import CheckoutButton from "./CheckoutButton";

interface TopUpModalProps {
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}

const AMOUNTS = [
  { label: "\u00A31", pence: 100 },
  { label: "\u00A35", pence: 500 },
  { label: "\u00A310", pence: 1000 },
];

export default function TopUpModal({ onClose, onSuccess }: TopUpModalProps) {
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-xl font-bold">Top Up Wallet</h2>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/80 text-2xl leading-none cursor-pointer"
          >
            x
          </button>
        </div>

        {status === "success" ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">&#10003;</div>
            <p className="text-green-400 font-semibold text-lg">Payment successful!</p>
            <p className="text-white/50 text-sm mt-1">Your wallet has been topped up.</p>
          </div>
        ) : (
          <>
            <p className="text-white/60 text-sm mb-4">Select an amount to add to the shared wallet:</p>

            <div className="flex gap-3 mb-6">
              {AMOUNTS.map((a) => (
                <button
                  key={a.pence}
                  onClick={() => setSelectedAmount(a.pence)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-lg transition-all cursor-pointer ${
                    selectedAmount === a.pence
                      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            {/* key forces full remount when amount changes, giving a fresh paymentRequest */}
            <CheckoutButton
              key={selectedAmount}
              amountPence={selectedAmount}
              onSuccess={(balance) => {
                setStatus("success");
                setTimeout(() => onSuccess(balance), 1000);
              }}
              onError={() => setStatus("error")}
            />

            {status === "error" && (
              <p className="text-red-400 text-sm text-center mt-3">
                Payment failed. Please try again.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
