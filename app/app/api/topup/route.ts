import { NextResponse } from "next/server";
import { getStripe } from "@/app/lib/stripe";
import { addBalance, logTransaction } from "@/app/lib/wallet";

const ALLOWED_AMOUNTS = [100, 500, 1000]; // pence: £1, £5, £10

export async function POST(req: Request) {
  try {
    const { amountPence } = await req.json();

    if (!ALLOWED_AMOUNTS.includes(amountPence)) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
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
