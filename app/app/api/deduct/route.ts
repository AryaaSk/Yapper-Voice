import { NextResponse } from "next/server";
import { deductBalance, logTransaction } from "@/app/lib/wallet";

export async function POST(req: Request) {
  try {
    const { amountPence, callId } = await req.json();

    if (!amountPence || amountPence <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const { success, newBalance } = await deductBalance(amountPence);

    if (!success) {
      return NextResponse.json({ error: "Insufficient balance", balance: newBalance }, { status: 402 });
    }

    await logTransaction("call_charge", -amountPence, { callId });

    return NextResponse.json({ balance: newBalance });
  } catch (error: any) {
    console.error("Deduction error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
