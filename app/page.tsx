"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07163a] via-[#07224a] to-[#042b57] text-slate-100 antialiased">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-40 -top-40 w-[720px] h-[720px] rounded-full blur-3xl opacity-40 bg-gradient-to-r from-[#00b4ff] to-[#4f46e5] animate-blob" />
        <div className="absolute -left-56 bottom-[-160px] w-[560px] h-[560px] rounded-full blur-2xl opacity-30 bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] animate-blob animation-delay-2000" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur p-2 flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L20 7v10l-8 5-8-5V7l8-5z"
                  stroke="#9be7ff"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="12"
                  cy="11"
                  r="2"
                  stroke="#dff9ff"
                  strokeWidth="1.2"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold tracking-tight">EduChain</h3>
              <p className="text-xs text-slate-300">
                Blockchain-Powered Certificates
              </p>
            </div>
          </div>

          <nav className="hidden md:flex gap-6 items-center text-sm text-slate-200">
            <a className="hover:underline" href="#why">
              Why
            </a>
            <a className="hover:underline" href="#integration">
              Integrations
            </a>
            <a className="hover:underline" href="#security">
              Security
            </a>
            <button className="ml-2 rounded-md bg-white/6 px-4 py-2 text-slate-100 text-sm backdrop-blur hover:bg-white/10">
              Get Started
            </button>
          </nav>
        </div>

        <section className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter">
              Credentials,{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#a7f3d0] via-[#60a5fa] to-[#dbeafe]">
                Verified.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Enterprise-grade credential issuance & verification. Built on SUI,
              designed for SaaS scale — low friction APIs, lightning
              verification, and cryptographic guarantees.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => (window.location.href = "/auth/signup")}
                className="inline-flex items-center gap-3 rounded-full bg-[#0ea5e9] px-6 py-3 text-sm font-semibold shadow-lg hover:brightness-105 transform-gpu transition"
              >
                Get Started
                <ArrowRight size={16} />
              </button>

              <a
                href="#why"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-slate-200 hover:bg-white/3"
              >
                See why we win
              </a>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 max-w-md text-slate-200">
              <div className="rounded-lg bg-white/3 p-4 backdrop-blur-sm border border-white/6">
                <p className="text-2xl font-bold">99.99%</p>
                <p className="text-xs text-slate-300">Uptime guaranteed</p>
              </div>
              <div className="rounded-lg bg-white/3 p-4 backdrop-blur-sm border border-white/6">
                <p className="text-2xl font-bold">500ms</p>
                <p className="text-xs text-slate-300">
                  Average verification speed
                </p>
              </div>
              <div className="rounded-lg bg-white/3 p-4 backdrop-blur-sm border border-white/6">
                <p className="text-2xl font-bold">2M+</p>
                <p className="text-xs text-slate-300">Credentials issued</p>
              </div>
              <div className="rounded-lg bg-white/3 p-4 backdrop-blur-sm border border-white/6">
                <p className="text-2xl font-bold">1M+</p>
                <p className="text-xs text-slate-300">Certs minted</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="mx-auto w-full max-w-lg rounded-2xl bg-gradient-to-b from-white/5 to-white/3 border border-white/6 p-6 backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-300">Live Monitor</p>
                  <h4 className="font-semibold text-lg">
                    Verification Pipeline
                  </h4>
                </div>
                <div className="text-xs text-slate-300">
                  SUI • Node‑friendly
                </div>
              </div>

              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-white/6 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#34d399] to-[#60a5fa]"
                    style={{ width: "70%" }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-xs text-slate-300">
                  <span>Throughput</span>
                  <span>70% — healthy</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-lg p-3 bg-white/4 border border-white/6">
                  <p className="text-xs text-slate-300">Requests / s</p>
                  <p className="font-bold text-lg">1.2k</p>
                </div>
                <div className="rounded-lg p-3 bg-white/4 border border-white/6">
                  <p className="text-xs text-slate-300">Avg Latency</p>
                  <p className="font-bold text-lg">500ms</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="flex-1 rounded-md bg-[#06b6d4] py-2 font-semibold">
                  View Dashboard
                </button>
                <button className="flex-1 rounded-md border border-white/8 bg-transparent py-2">
                  Docs
                </button>
              </div>
            </div>

            {/* futuristic mock device overlay */}
            <div className="absolute -right-6 -bottom-10 w-44 h-44 rounded-2xl bg-gradient-to-br from-white/4 to-white/6 border border-white/8 transform rotate-6 shadow-2xl" />
          </motion.div>
        </section>

        <section
          id="why"
          className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <motion.div
            whileHover={{ y: -6 }}
            className="rounded-2xl p-6 bg-white/4 border border-white/6 backdrop-blur"
          >
            <h3 className="text-lg font-semibold">Why Choose EduChain?</h3>
            <p className="mt-3 text-sm text-slate-300">
              Plug-and-play credentialing for SaaS. High throughput, low
              latency, cryptographically sound — and designed to meet enterprise
              SLAs.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="rounded-2xl p-6 bg-white/4 border border-white/6 backdrop-blur"
          >
            <h3 className="text-lg font-semibold">Simple Integration</h3>
            <p className="mt-3 text-sm text-slate-300">
              REST APIs, Webhooks, SDKs — and quick start templates for Node,
              Python, and Next.js so your engineers stop wasting time and start
              shipping.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="rounded-2xl p-6 bg-white/4 border border-white/6 backdrop-blur"
          >
            <h3 className="text-lg font-semibold">Secure & Scalable</h3>
            <p className="mt-3 text-sm text-slate-300">
              Built on SUI’s high-throughput capabilities with best-in-class key
              management and on-chain proofs for disputability and auditability.
            </p>
          </motion.div>
        </section>

        <section
          id="integration"
          className="mt-16 bg-gradient-to-r from-white/3 to-white/6 rounded-3xl p-8 border border-white/6"
        >
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold">
                Plug into your SaaS workflow
              </h3>
              <p className="mt-3 text-slate-300">
                REST APIs, Webhooks and SDKs for instant adoption. Example: mint
                a verifiable cert in 3 lines of code.
              </p>

              <pre className="mt-4 rounded-md bg-[#021026] p-4 text-xs overflow-auto text-slate-200 border border-white/6">
                {`// node / express example
POST /api/mint  { userId, templateId }
// returns { txHash, credentialId }
`}
              </pre>

              <div className="mt-6 flex gap-3">
                <button className="rounded-full bg-[#1e90ff] px-5 py-2 font-semibold">
                  Get API Keys
                </button>
                <button className="rounded-full border border-white/10 px-5 py-2">
                  Explore SDKs
                </button>
              </div>
            </div>

            <div className="w-full lg:w-1/3">
              <div className="rounded-xl border border-white/6 p-4 bg-gradient-to-b from-white/5 to-transparent">
                <p className="text-xs text-slate-300">Tech highlights</p>
                <ul className="mt-3 text-sm space-y-2 text-slate-200">
                  <li>• SUI-backed on-chain proofs</li>
                  <li>• REST + Webhooks + SDKs</li>
                  <li>• Enterprise SLA & compliance</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section
          id="security"
          className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        >
          <div>
            <h3 className="text-2xl font-semibold">
              Secure, Scalable, Verified
            </h3>
            <p className="mt-3 text-slate-300">
              Built with SUI’s high-throughput blockchain, but not bound by it.
              Our platform delivers seamless credentialing without complexity.
              Audit logs, revocation, and privacy controls included.
            </p>

            <div className="mt-6 flex gap-3">
              <button className="rounded-md bg-[#06b6d4] px-5 py-2 font-semibold">
                Security Whitepaper
              </button>
              <button className="rounded-md border border-white/10 px-5 py-2">
                Compliance
              </button>
            </div>
          </div>

          <div>
            <div className="rounded-xl p-6 bg-white/3 border border-white/6">
              <h4 className="text-sm text-slate-300">
                On-chain proof snapshot
              </h4>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded p-3 bg-white/4">
                  Tx: <span className="font-mono text-xs">0x34f...9a1</span>
                </div>
                <div className="rounded p-3 bg-white/4">
                  Status: <strong>Confirmed</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-20 py-12 text-center text-slate-300">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm">
              © 2025 EduChain — Blockchain-Powered Credentialing
            </p>
            <p className="mt-3 text-xs text-slate-400">
              Designed for SaaS scale • Built on SUI • Enterprise SLAs
            </p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translateY(0px) scale(1);
          }
          33% {
            transform: translateY(-20px) scale(1.06);
          }
          66% {
            transform: translateY(8px) scale(0.98);
          }
          100% {
            transform: translateY(0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
