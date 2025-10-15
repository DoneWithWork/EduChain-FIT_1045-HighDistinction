"use client";

import { useZkCredentials } from "@/hooks/useEphemeralSession";
import { suiClient } from "@/lib/sui";
import { PublicZkLoginService } from "@/lib/zkLogin";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const { zkCredentials, initialized } = useZkCredentials();
  const router = useRouter();
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const handleZkLogin = useCallback(async () => {
    if (!initialized) return;

    setLoading(true);
    try {
      const loginClass = new PublicZkLoginService(suiClient);
      const authUrl = await loginClass.constructGoogleAuthUrl(
        zkCredentials.nonce!
      );
      setLoginUrl(authUrl);
      console.log("zkLogin success (mock)");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [initialized, zkCredentials.nonce]);

  useEffect(() => {
    handleZkLogin();
  }, [initialized, handleZkLogin]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#040d1a] text-slate-100">
      {/* === Background Gradient === */}
      <div className="absolute inset-0 -z-20">
        <div className="absolute inset-0 bg-gradient-to-b from-[#030b18] via-[#041023] to-[#010713]" />
        <div className="absolute -top-40 left-1/2 w-[700px] h-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#00b4ff] to-[#2563eb] opacity-30 blur-[180px] animate-pulse-glow" />
      </div>

      {/* === Login Card === */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-[90%] max-w-md bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex justify-center mb-6"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00b4ff] to-[#2563eb] flex items-center justify-center text-white font-bold text-xl shadow-lg">
            S
          </div>
        </motion.div>

        <h1 className="text-2xl font-semibold tracking-tight">
          Sign in with zkLogin
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Authenticate securely with Google — verified on-chain via SUI zkLogin.
        </p>

        <div className="mt-8">
          <button
            disabled={loading}
            onClick={() => {
              if (!loading) {
                router.push(loginUrl!);
              }
            }}
            className="w-full flex items-center justify-center gap-3 border cursor-pointer border-slate-700 bg-[#0a1426] hover:bg-[#0e1b33] rounded-md py-2 text-sm font-medium transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Logging you in</span>
              </>
            ) : (
              <>
                <Image
                  src="https://www.svgrepo.com/show/355037/google.svg"
                  alt="Google"
                  width={100}
                  height={100}
                  className="w-5 h-5"
                />
                <span>Continue with Google</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-10 text-xs text-slate-500">
          <p>
            Powered by{" "}
            <span className="font-semibold text-[#00b4ff]">SUI zkLogin</span>
          </p>
          <p className="mt-1">Zero-Knowledge, Maximum Privacy.</p>
        </div>
      </motion.div>
    </div>
  );
}
