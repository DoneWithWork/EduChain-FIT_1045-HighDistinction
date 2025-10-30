"use client";

import { setCookie } from "cookies-next/client";
import { useRouter } from "next/navigation";
type PaymentButtonProps = {
  plan: {
    title: string;
    paymentLink: string;
    buttonText: string;
    plan: string;
  };
  loggedIn: boolean;
};
export default function PaymentButton({ plan, loggedIn }: PaymentButtonProps) {
  const router = useRouter();
  const handleSubscribe = (paymentLink: string) => {
    if (loggedIn) {
      router.push(paymentLink);
    } else {
      setCookie("intended_plan", plan.plan, { path: "/" });
      router.push("/auth");
    }
  };

  return (
    <button
      onClick={() => handleSubscribe(plan.paymentLink)}
      className={`mt-6 w-full cursor-pointer rounded-md py-2.5 text-sm font-semibold transition ${
        plan.title === "Pro"
          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
          : "bg-slate-700 hover:bg-slate-600 text-slate-100"
      }`}
    >
      {plan.buttonText}
    </button>
  );
}
