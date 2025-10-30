"use client";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-[#07163a] via-[#07224a] to-[#042b57] text-slate-100 antialiased">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        {/* Header */}
        <Header />

        {/* Hero Section */}
        <section className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter">
              Certificates,{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-[#a7f3d0] via-[#60a5fa] to-[#dbeafe]">
                Verified on-chain.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg text-slate-300">
              EduChain lets educators issue tamper-proof digital certificates on
              the SUI blockchain. Fast, transparent, and easy to verify — all
              through a simple dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => (window.location.href = "/auth")}
                className="inline-flex items-center gap-3 cursor-pointer rounded-full bg-[#0ea5e9] px-6 py-3 text-sm font-semibold shadow-lg hover:brightness-105 transform-gpu transition"
              >
                Get Started
                <ArrowRight size={16} />
              </button>

              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm text-slate-200 hover:bg-white/3"
              >
                Learn More
              </a>
            </div>
          </motion.div>

          {/* Mock UI */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="mx-auto w-full max-w-lg rounded-2xl bg-linear-to-b from-white/5 to-white/3 border border-white/6 p-6 backdrop-blur-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-300">On-Chain Dashboard</p>
                  <h4 className="font-semibold text-lg">Certificate Minting</h4>
                </div>
                <div className="text-xs text-slate-300">MOVE • SUI</div>
              </div>

              <pre className="mt-4 rounded-md bg-[#021026] p-4 text-xs overflow-auto text-slate-200 border border-white/6">
                {`// Example MOVE struct
struct Certificate has key {
  id: UID,
  owner: address,
  metadata: vector<u8>,
}`}
              </pre>

              <div className="mt-6 flex gap-3">
                <Link
                  href={
                    "https://github.com/DoneWithWork/EduChain-FIT_1045-HighDistinction/blob/master/contracts/sources/cert.move"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-md bg-[#06b6d4] py-2 font-semibold text-center"
                >
                  <span>View Code</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section
          id="how"
          className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <motion.div
            whileHover={{ y: -6 }}
            className="rounded-2xl p-6 bg-white/4 border border-white/6 backdrop-blur"
          >
            <h3 className="text-lg font-semibold">1. Mint</h3>
            <p className="mt-3 text-sm text-slate-300">
              Educational institutions mint certificates using MOVE smart
              contracts on the SUI blockchain.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="rounded-2xl p-6 bg-white/4 border border-white/6 backdrop-blur"
          >
            <h3 className="text-lg font-semibold">2. Manage</h3>
            <p className="mt-3 text-sm text-slate-300">
              Users access a TypeScript-powered dashboard to view, organize, and
              share their credentials.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -6 }}
            className="rounded-2xl p-6 bg-white/4 border border-white/6 backdrop-blur"
          >
            <h3 className="text-lg font-semibold">3. Verify</h3>
            <p className="mt-3 text-sm text-slate-300">
              Employers verify authenticity instantly — no intermediaries, no
              forgery.
            </p>
          </motion.div>
        </section>

        {/* Feature Section */}
        <section
          id="features"
          className="mt-16 bg-linear-to-r from-white/3 to-white/6 rounded-3xl p-8 border border-white/6"
        >
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-semibold">Built for simplicity</h3>
              <p className="mt-3 text-slate-300">
                EduChain isn’t enterprise bloat. It’s a lean SaaS — easy to
                integrate, privacy-first, and ready for educators, learners, and
                verifiers alike.
              </p>

              <ul className="mt-5 text-sm text-slate-200 space-y-2">
                <li>• Built on SUI blockchain</li>
                <li>• MOVE-based smart contracts</li>
                <li>• Next.js + TypeScript frontend</li>
                <li>• Zero-Knowledge login</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section
          id="security"
          className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
        >
          <div>
            <h3 className="text-2xl font-semibold">Transparent by design</h3>
            <p className="mt-3 text-slate-300">
              Every certificate lives on-chain — verifiable, permanent, and
              secure. Users control their own data with privacy-preserving
              authentication.
            </p>
            <div className="mt-6 flex flex-col items-center">
              <Link
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md bg-[#06b6d4] px-5 py-2 font-semibold"
                href={
                  "https://suiscan.xyz/testnet/object/0xb983c737cf45cd655bcc73e9f6e0de87328001060de16262467d99098fedf07e/tx-blocks"
                }
              >
                View Smart Contract
              </Link>
            </div>
          </div>

          <div>
            <div className="rounded-xl p-6 bg-white/3 border border-white/6">
              <h4 className="text-sm text-slate-300">Verification Snapshot</h4>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded p-3 bg-white/4">
                  Tx: <span className="font-mono text-xs">0x9f3...a4d</span>
                </div>
                <div className="rounded p-3 bg-white/4">
                  Status: <strong>Active</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 py-12 text-center text-slate-300">
          <div className="max-w-2xl mx-auto">
            <p className="text-sm">
              © 2025 EduChain — SUI-powered certification SaaS
            </p>
            <p className="mt-3 text-xs text-slate-400">
              MOVE • TypeScript • Next.js • Zero-Knowledge ready
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
