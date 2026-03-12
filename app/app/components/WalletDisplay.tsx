"use client";

import { useState } from "react";
import TopUpModal from "./TopUpModal";

interface WalletDisplayProps {
  balance: number;
  onBalanceUpdate: (newBalance: number) => void;
  costPerMinutePence?: number;
}

export default function WalletDisplay({ balance, onBalanceUpdate, costPerMinutePence }: WalletDisplayProps) {
  const [showTopUp, setShowTopUp] = useState(false);

  const pounds = (balance / 100).toFixed(2);

  return (
    <>
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-2 rounded-full px-3.5 py-1.5"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.50)" }}>Balance</span>
          <span className="font-semibold text-sm tabular-nums text-white">
            {"\u00A3"}{pounds}
          </span>
        </div>
        <button
          onClick={() => setShowTopUp(true)}
          className="font-medium px-3.5 py-1.5 rounded-full text-sm transition-colors cursor-pointer"
          style={{ background: "#7c6df7", color: "#fff" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#9b8fff")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#7c6df7")}
        >
          Top up
        </button>
      </div>

      {showTopUp && (
        <TopUpModal
          costPerMinutePence={costPerMinutePence}
          onClose={() => setShowTopUp(false)}
          onSuccess={(newBalance) => {
            onBalanceUpdate(newBalance);
            setShowTopUp(false);
          }}
        />
      )}
    </>
  );
}
