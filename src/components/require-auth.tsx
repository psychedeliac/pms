"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, type Session } from "@/lib/auth";

export default function RequireAuth({
  children,
}: {
  children: (session: Session) => React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const existing = getSession();
    if (!existing) {
      router.replace("/login");
      return;
    }
    // localStorage is unavailable during SSR, so this must run post-mount to
    // avoid a hydration mismatch — not a candidate for a derived/lazy value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession(existing);
  }, [router]);

  if (!session) return null;
  return <>{children(session)}</>;
}
