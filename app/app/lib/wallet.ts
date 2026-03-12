import { db, ref, runTransaction, getDb } from "@/backend/firebase";

const WALLET_PATH = "smart_friend/wallet";
const TRANSACTIONS_PATH = "smart_friend/transactions";
const CALLS_PATH = "smart_friend/calls";

// All amounts stored in pence (GBP)

export async function getBalance(): Promise<number> {
  const wallet = await db.get(WALLET_PATH);
  return wallet?.balance ?? 0;
}

export async function addBalance(amountPence: number): Promise<number> {
  const balanceRef = ref(getDb(), `${WALLET_PATH}/balance`);
  let newBalance = 0;

  await runTransaction(balanceRef, (current) => {
    const currentBalance = current ?? 0;
    newBalance = currentBalance + amountPence;
    return newBalance;
  });

  await db.update(WALLET_PATH, { lastUpdated: new Date().toISOString() });
  return newBalance;
}

export async function deductBalance(amountPence: number): Promise<{ success: boolean; newBalance: number }> {
  const balanceRef = ref(getDb(), `${WALLET_PATH}/balance`);
  let newBalance = 0;
  let success = false;

  await runTransaction(balanceRef, (current) => {
    const currentBalance = current ?? 0;
    if (currentBalance < amountPence) {
      newBalance = currentBalance;
      return currentBalance;
    }
    newBalance = currentBalance - amountPence;
    success = true;
    return newBalance;
  });

  if (success) {
    await db.update(WALLET_PATH, { lastUpdated: new Date().toISOString() });
  }

  return { success, newBalance };
}

export async function logTransaction(
  type: "topup" | "call_charge",
  amountPence: number,
  metadata?: { stripePaymentId?: string; callId?: string }
) {
  const data: Record<string, any> = {
    type,
    amount: amountPence,
    timestamp: new Date().toISOString(),
  };
  if (metadata?.stripePaymentId) data.stripePaymentId = metadata.stripePaymentId;
  if (metadata?.callId) data.callId = metadata.callId;
  return db.push(TRANSACTIONS_PATH, data);
}

export async function logCall(callData: {
  startTime: string;
  endTime?: string;
  durationSeconds: number;
  costPence: number;
  status: "active" | "completed" | "failed";
}) {
  return db.push(CALLS_PATH, callData);
}

export async function updateCall(callId: string, updates: Partial<{
  endTime: string;
  durationSeconds: number;
  costPence: number;
  status: "active" | "completed" | "failed";
}>) {
  return db.update(`${CALLS_PATH}/${callId}`, updates);
}
