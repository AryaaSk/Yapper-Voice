"use client";

import { useState } from "react";
import TopUpModal from "./TopUpModal";

interface WalletDisplayProps {
  balance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

export default function WalletDisplay({ balance, onBalanceUpdate }: WalletDisplayProps) {
  const [showTopUp, setShowTopUp] = useState(false);

  const pounds = (balance / 100).toFixed(2);

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2">
          <span className="text-white/60 text-sm">Balance</span>
          <span className="text-white font-bold text-lg">{"\u00A3"}{pounds}</span>
        </div>
        <button
          onClick={() => setShowTopUp(true)}
          className="bg-white text-gray-900 font-semibold px-4 py-2 rounded-2xl text-sm hover:bg-white/90 transition-colors cursor-pointer"
        >
          Top Up
        </button>
      </div>

      {showTopUp && (
        <TopUpModal
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
