"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { logout, type Session } from "@/lib/auth";

const NAV_ITEMS = [
  { label: "Dashboard", icon: "/reservations/icons/nav-dashboard.svg" },
  {
    label: "Reservations",
    icon: "/reservations/icons/nav-reservations.svg",
    href: "/reservations",
  },
  { label: "Front Desk", icon: "/reservations/icons/nav-front-desk.svg" },
  { label: "Room Service", icon: "/reservations/icons/nav-room-service.svg" },
  { label: "Housekeeping", icon: "/reservations/icons/nav-housekeeping.svg" },
  { label: "Billing", icon: "/reservations/icons/nav-billing.svg" },
  { label: "Reports", icon: "/reservations/icons/nav-reports.svg" },
  { label: "Settings", icon: "/reservations/icons/nav-settings.svg" },
];

const ACTIVE_LABEL = "Reservations";

export default function Sidebar({ session }: { session: Session }) {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <aside className="flex min-h-screen w-[256px] shrink-0 flex-col justify-between border-r border-white/5 bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] px-5 py-5">
      <div>
        <div className="flex items-center gap-[10px] p-2 pb-8">
          <div
            className="flex size-9 items-center justify-center rounded-lg shadow-[0px_10px_15px_-3px_rgba(16,185,129,0.2),0px_4px_6px_-4px_rgba(16,185,129,0.2)]"
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%)",
            }}
          >
            <Image
              src="/reservations/icons/logo-mark.svg"
              alt=""
              width={16}
              height={16}
            />
          </div>
          <div>
            <p className="text-[18px] font-medium leading-[28px] tracking-[-0.45px] text-[#f9fafb]">
              concierge
            </p>
            <p className="text-[9px] font-light uppercase leading-[13.5px] tracking-[0.45px] text-[#9ca3af]">
              Hotel Management
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = item.label === ACTIVE_LABEL;
            const content = (
              <>
                <span className="flex size-4 items-center justify-center">
                  <Image src={item.icon} alt="" width={14} height={14} />
                </span>
                <span
                  className={`pl-3 text-sm ${
                    isActive ? "font-normal text-white" : "font-light text-[#9ca3af]"
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="ml-auto size-1 shrink-0 rounded-full bg-[#10b981]" />
                )}
              </>
            );

            const className = `flex w-full items-center rounded-lg border p-[13px] transition-colors duration-200 ${
              isActive
                ? "border-[rgba(16,185,129,0.2)] bg-gradient-to-r from-[rgba(16,185,129,0.2)] to-[rgba(16,185,129,0.05)]"
                : "border-transparent hover:bg-white/5"
            }`;

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`${className} cursor-pointer`}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div key={item.label} className={className} aria-disabled>
                {content}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/5 pt-[21px]">
        <motion.button
          type="button"
          onClick={handleLogout}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="flex w-full cursor-pointer items-center gap-[10px] rounded-xl border border-white/5 bg-[rgba(26,26,26,0.6)] p-3 backdrop-blur-[10px] transition-colors hover:bg-[rgba(26,26,26,0.9)]"
        >
          <span className="relative shrink-0">
            <span className="block size-10 overflow-hidden rounded-lg shadow-[0px_0px_0px_2px_rgba(16,185,129,0.2)]">
              <Image
                src={session.avatar}
                alt=""
                width={40}
                height={40}
                className="size-full object-cover"
              />
            </span>
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#1a1a1a] bg-[#10b981]" />
          </span>
          <span className="flex-1 text-left">
            <p className="text-xs leading-4 text-white">{session.name}</p>
            <p className="text-[10px] leading-[15px] font-light text-[#9ca3af]">
              {session.role}
            </p>
          </span>
          <Image
            src="/reservations/icons/user-chevron.svg"
            alt="Sign out"
            width={12}
            height={12}
          />
        </motion.button>
      </div>
    </aside>
  );
}
