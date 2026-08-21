"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setPending(false);
      setError(error.message);
      return;
    }

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
          <div className="flex size-11 items-center justify-center rounded-lg bg-ink shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.15),0px_4px_6px_-4px_rgba(0,0,0,0.15)]">
            <Image
              src="/reservations/icons/logo-mark.svg"
              alt=""
              width={18}
              height={18}
              className="invert-0 dark:invert"
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
              className="rounded-lg border border-border/5 bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink/30"
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
              className="rounded-lg border border-border/5 bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink/30"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-border/20 px-3 py-2 text-xs font-normal text-ink">
              {error}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={pending}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="mt-2 cursor-pointer rounded-lg bg-ink py-2.5 text-sm font-normal text-background shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.15),0px_4px_6px_-4px_rgba(0,0,0,0.15)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Signing in..." : "Sign In"}
          </motion.button>
        </motion.form>

        <p className="mt-6 text-center text-[11px] font-light text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-ink hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
