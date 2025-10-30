"use client";

import { useZkCredentials } from "@/hooks/useEphemeralSession";
import { suiClient } from "@/lib/sui";
import { PublicZkLoginService } from "@/lib/zkLogin";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function AuthLogin() {
  const { zkCredentials, initialized } = useZkCredentials();
  const [loading, setLoading] = useState(false);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleZkLogin = useCallback(async () => {
    if (!initialized) return;
    setLoading(true);
    try {
      const zkService = new PublicZkLoginService(suiClient);
      const url = await zkService.constructGoogleAuthUrl(zkCredentials.nonce!);
      setLoginUrl(url);
    } catch (err) {
      console.error("zkLogin failed:", err);
    } finally {
      setLoading(false);
    }
  }, [initialized, zkCredentials.nonce]);

  useEffect(() => {
    handleZkLogin();
  }, [handleZkLogin]);

  const onLoginClick = () => {
    if (!loading && loginUrl) router.push(loginUrl);
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className=" max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#00b4ff] to-[#2563eb] font-bold text-xl shadow-lg"
        >
          S
        </motion.div>

        <h1 className="text-2xl font-semibold">Sign in with zkLogin</h1>
        <p className="mt-2 text-sm text-slate-400">
          Authenticate securely with Google — verified on-chain via SUI zkLogin.
        </p>

        <button
          disabled={loading}
          onClick={onLoginClick}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-md border border-slate-700 bg-[#0a1426] py-3 cursor-pointer text-sm font-medium transition  hover:bg-[#0e1b33] disabled:cursor-not-allowed disabled:opacity-70"
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
                width={30}
                height={30}
              />
              <span className="font-semibold ">Continue with Google</span>
            </>
          )}
        </button>

        <div className="mt-10 text-xs text-slate-500">
          <p>
            Powered by{" "}
            <span className="font-semibold text-[#00b4ff]">SUI zkLogin</span>
          </p>
          <p>Zero-Knowledge, Maximum Privacy.</p>
        </div>
      </motion.div>
    </div>
  );
}
