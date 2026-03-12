"use client";

import { useEffect, useState, useCallback } from "react";
import { loadStripe, Stripe, PaymentRequestPaymentMethodEvent } from "@stripe/stripe-js";
import { Elements, PaymentRequestButtonElement } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

interface CheckoutButtonProps {
  amountPence: number;
  onSuccess: (newBalance: number) => void;
  onError: () => void;
}

export default function CheckoutButton({ amountPence, onSuccess, onError }: CheckoutButtonProps) {
  const [paymentRequest, setPaymentRequest] = useState<any | null>(null);
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);

  useEffect(() => {
    async function init() {
      const stripe = await stripePromise;
      if (!stripe) return;
      setStripeInstance(stripe);

      const pr = stripe.paymentRequest({
        country: "GB",
        currency: "gbp",
        total: {
          label: "Smart Friend Top Up",
          amount: amountPence,
        },
        requestPayerEmail: false,
      });

      const result = await pr.canMakePayment();
      if (result) {
        setPaymentRequest(pr);
      }
    }
    init();
  }, [amountPence]);

  const handlePayment = useCallback(
    async (event: PaymentRequestPaymentMethodEvent) => {
      if (!stripeInstance) return;

      try {
        const response = await fetch("/api/topup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amountPence }),
        });

        if (!response.ok) throw new Error("Failed to create payment intent");

        const { clientSecret, balance } = await response.json();

        const { error, paymentIntent } = await stripeInstance.confirmCardPayment(
          clientSecret,
          { payment_method: event.paymentMethod.id }
        );

        if (error) {
          event.complete("fail");
          onError();
        } else if (paymentIntent.status === "succeeded") {
          event.complete("success");
          onSuccess(balance);
        }
      } catch {
        event.complete("fail");
        onError();
      }
    },
    [stripeInstance, amountPence, onSuccess, onError]
  );

  useEffect(() => {
    if (!paymentRequest) return;
    paymentRequest.on("paymentmethod", handlePayment);
    return () => {
      paymentRequest.off("paymentmethod", handlePayment);
    };
  }, [paymentRequest, handlePayment]);

  return (
    <Elements stripe={stripePromise}>
      {paymentRequest ? (
        <PaymentRequestButtonElement
          options={{
            paymentRequest,
            style: {
              paymentRequestButton: {
                height: "48px",
                type: "default",
                theme: "light",
              },
            },
          }}
        />
      ) : (
        <p className="text-center text-white/40 text-sm py-3">
          Apple Pay / Google Pay loading...
        </p>
      )}
    </Elements>
  );
}
