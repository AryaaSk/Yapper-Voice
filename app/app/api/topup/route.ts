import { NextResponse } from "next/server";
import { getStripe } from "@/app/lib/stripe";
import { addBalance, logTransaction } from "@/app/lib/wallet";

const MIN_AMOUNT = 50;   // £0.50
const MAX_AMOUNT = 5000; // £50.00

export async function POST(req: Request) {
  try {
    const { amountPence } = await req.json();

    if (typeof amountPence !== "number" || !Number.isInteger(amountPence) || amountPence < MIN_AMOUNT || amountPence > MAX_AMOUNT) {
      return NextResponse.json({ error: "Amount must be between £0.50 and £50.00" }, { status: 400 });
    }

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: amountPence,
      currency: "gbp",
      payment_method_types: ["card"],
    });

    const newBalance = await addBalance(amountPence);
    await logTransaction("topup", amountPence, {
      stripePaymentId: paymentIntent.id,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      balance: newBalance,
    });
  } catch (error: any) {
    console.error("Top-up payment intent error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
