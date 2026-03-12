import { NextResponse } from "next/server";
import { getBalance } from "@/app/lib/wallet";

export async function GET() {
  try {
    const balance = await getBalance();
    return NextResponse.json({ balance });
  } catch (error: any) {
    console.error("Error fetching wallet balance:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
