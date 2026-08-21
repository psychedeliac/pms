"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    login();
    router.replace("/reservations");
  }

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-page-gradient p-6">
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm rounded-xl border border-border/5 bg-surface p-8 backdrop-blur-[10px]"
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-8 flex flex-col items-center gap-3"
        >
          <div
            className="flex size-11 items-center justify-center rounded-lg shadow-[0px_10px_15px_-3px_rgba(16,185,129,0.2),0px_4px_6px_-4px_rgba(16,185,129,0.2)]"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%)",
            }}
          >
            <Image
              src="/reservations/icons/logo-mark.svg"
              alt=""
              width={18}
              height={18}
            />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium leading-7 tracking-[-0.45px] text-ink">
              concierge
            </p>
            <p className="text-[9px] font-light uppercase leading-[13.5px] tracking-[0.45px] text-muted">
              Hotel Management
            </p>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4 }}
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-light text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-border/5 bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-[#10b981]"
              placeholder="you@hotel.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-light text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-border/5 bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-[#10b981]"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="mt-2 cursor-pointer rounded-lg bg-gradient-to-r from-[#10b981] to-[#059669] py-2.5 text-sm font-normal text-white shadow-[0px_10px_15px_-3px_rgba(16,185,129,0.2),0px_4px_6px_-4px_rgba(16,185,129,0.2)]"
          >
            Sign In
          </motion.button>
        </motion.form>

        <p className="mt-6 text-center text-[11px] font-light text-muted">
          Demo mode — just click Sign In to continue.
        </p>
      </motion.div>
    </div>
  );
}
