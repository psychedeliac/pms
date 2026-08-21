"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      login(email, password);
      router.replace("/reservations");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <div
      className="flex min-h-screen flex-1 items-center justify-center p-6"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(13, 13, 13) 100%)",
      }}
    >
      <div className="w-full max-w-sm rounded-xl border border-white/5 bg-[rgba(26,26,26,0.6)] p-8 backdrop-blur-[10px]">
        <div className="mb-8 flex flex-col items-center gap-3">
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
            <p className="text-lg font-medium leading-7 tracking-[-0.45px] text-[#f9fafb]">
              concierge
            </p>
            <p className="text-[9px] font-light uppercase leading-[13.5px] tracking-[0.45px] text-[#9ca3af]">
              Hotel Management
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-light text-[#9ca3af]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-white/5 bg-[rgba(26,26,26,0.6)] px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#9ca3af] focus:border-[#10b981]"
              placeholder="you@hotel.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-light text-[#9ca3af]">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-white/5 bg-[rgba(26,26,26,0.6)] px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#9ca3af] focus:border-[#10b981]"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs text-[#f87171]">{error}</p>}

          <button
            type="submit"
            className="mt-2 rounded-lg bg-gradient-to-r from-[#10b981] to-[#059669] py-2.5 text-sm font-normal text-white shadow-[0px_10px_15px_-3px_rgba(16,185,129,0.2),0px_4px_6px_-4px_rgba(16,185,129,0.2)] transition-opacity hover:opacity-90"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] font-light text-[#9ca3af]">
          Demo credentials: ana@concierge.com / concierge123
        </p>
      </div>
    </div>
  );
}
