import Header from "@/components/Header";
import { sessionManager } from "@/lib/auth";
import { plans } from "@/lib/stripe";
import PaymentButton from "@/ui/PaymentButton";

export default async function PricingPage() {
  const loggedIn = (await sessionManager.getUser()) !== null ? true : false;
  return (
    <div className="min-h-screen bg-linear-to-b from-[#07163a] via-[#07224a] to-[#042b57] py-12 px-6 text-gray-100">
      <div className="max-w-6xl mx-auto">
        <Header />

        {/* Header */}
        <header className="text-center my-18">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            EduChain Pricing
          </h1>
          <p className="mt-3 text-slate-300 text-base">
            Choose the plan that fits your issuing needs — simple, scalable, and
            secure.
          </p>
        </header>

        {/* Pricing Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.title}
              className={`relative bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-md p-6 flex flex-col transition-transform hover:scale-[1.02] ${
                plan.title === "Pro" ? "ring-2 ring-indigo-400 scale-105" : ""
              }`}
            >
              {plan.title === "Pro" && (
                <div className="absolute -top-3 right-4 bg-indigo-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                  Popular
                </div>
              )}

              {/* Header */}
              <h2 className="text-xl font-semibold text-white">{plan.title}</h2>
              <p className="mt-1 text-sm text-slate-300">{plan.description}</p>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-300">
                  RM{plan.price}
                </span>
                {plan.price > 0 && (
                  <span className="text-sm text-slate-400">/month</span>
                )}
              </div>

              {/* Features */}
              <ul className="mt-6 space-y-2 text-sm text-slate-300 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-indigo-400">•</span>
                    {feature}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <PaymentButton plan={plan} loggedIn={loggedIn} />
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
