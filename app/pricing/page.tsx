"use client";
import React, { useState } from "react";

// Define a type for the pricing plans
interface Plan {
  id: string;
  title: string;
  monthly?: number;
  price?: string;
  desc: string;
  features: string[];
  featured: boolean;
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState<boolean>(false);

  const plans: Plan[] = [
    {
      id: "educator",
      title: "Educator",
      monthly: 10,
      desc: "Issue and verify certificates for classes & workshops",
      features: [
        "Up to 500 verifications / month",
        "Basic analytics",
        "Community support",
      ],
      featured: false,
    },
    {
      id: "guru",
      title: "Guru",
      monthly: 15,
      desc: "Advanced tools for course creators and small institutions",
      features: [
        "Up to 5,000 verifications / month",
        "Advanced analytics & webhooks",
        "Priority support",
      ],
      featured: true,
    },
    {
      id: "enterprise",
      title: "Enterprise",
      price: "Contact us",
      desc: "Custom integrations, SLAs, and on-chain audits",
      features: [
        "Unlimited verifications",
        "Dedicated account manager",
        "SLA, on-prem or cloud options",
      ],
      featured: false,
    },
  ];

  // Calculate monthly or yearly price safely
  const calculatePrice = (plan: Plan): string => {
    if (plan.price) return plan.price;
    if (plan.monthly === undefined) return "N/A";

    const yearly = plan.monthly * 12 * 0.85; // 15% discount for yearly
    return isYearly ? `RM${yearly.toFixed(0)}` : `RM${plan.monthly}`;
  };

  // Stripe payment handler mock
  const handleSubscribe = (plan: Plan): void => {
    if (!plan.monthly) return;

    const amount = isYearly ? plan.monthly * 12 * 0.85 : plan.monthly;
    alert(
      `Redirecting to Stripe Checkout for ${plan.title} at RM${amount.toFixed(
        2
      )}`
    );

    // TODO: Replace with actual Stripe Checkout session
    // e.g. createCheckoutSession(plan.id, amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07163a] via-[#07224a] to-[#042b57] py-12 px-6 text-gray-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            EduChain Pricing
          </h1>
          <p className="mt-3 text-slate-300">
            Web3 native digital certificate issuance & verification — secure,
            tamper-proof, and verifiable.
          </p>
          <p className="mt-4 text-sm font-semibold text-indigo-300">
            GO FULL SaaS — VC powered with money !!
          </p>
        </header>

        {/* Billing toggle */}
        <section className="flex justify-center mb-8">
          <div className="inline-flex items-center rounded-md bg-slate-800 p-1 shadow-sm">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-3 py-1 text-xs font-medium rounded-l-md transition ${
                !isYearly
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-indigo-300"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-3 py-1 text-xs font-medium rounded-r-md transition ${
                isYearly
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-indigo-300"
              }`}
            >
              Yearly{" "}
              <span className="ml-2 text-[10px] text-slate-400">
                (save 15%)
              </span>
            </button>
          </div>
        </section>

        {/* Pricing grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className={`relative bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-md p-6 flex flex-col transition-transform ${
                plan.featured ? "ring-2 ring-indigo-400 scale-105" : ""
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 right-4 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  Popular
                </div>
              )}

              {/* Plan header */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {plan.title}
                </h2>
                <p className="mt-1 text-sm text-slate-300">{plan.desc}</p>
              </div>

              {/* Plan price */}
              <div className="mt-auto">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-indigo-300">
                    {calculatePrice(plan)}
                  </span>
                  {!plan.price && (
                    <span className="text-sm text-slate-400">
                      {isYearly ? "/ year" : "/ month"}
                    </span>
                  )}
                </div>

                {/* Features list */}
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-sm text-slate-300"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mt-0.5 text-indigo-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Action button */}
                <div className="mt-6">
                  {plan.price === "Contact us" ? (
                    <a
                      href="mailto:sales@educhain.example?subject=Enterprise%20Pricing"
                      className="inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition border border-slate-600 text-slate-200 hover:bg-slate-700"
                    >
                      Contact Sales
                    </a>
                  ) : (
                    <button
                      onClick={() => handleSubscribe(plan)}
                      className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition ${
                        plan.featured
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : "border border-slate-600 text-slate-200 hover:bg-slate-700"
                      }`}
                    >
                      {isYearly ? "Subscribe Yearly" : "Subscribe Monthly"}
                    </button>
                  )}
                </div>

                <div className="mt-4 text-xs text-slate-400">
                  Secure payments powered by Stripe. On-chain receipts and
                  verifiable claims included.
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-10 text-center text-sm text-slate-400">
          <p>
            Need a tailored solution? Email{" "}
            <a
              className="text-indigo-400 underline"
              href="mailto:sales@educhain.example"
            >
              sales@educhain.example
            </a>{" "}
            or request a demo.
          </p>
        </footer>
      </div>
    </div>
  );
}
