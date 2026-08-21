"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  CalendarCheck,
  ConciergeBell,
  UtensilsCrossed,
  Sparkles,
  Receipt,
  ChartColumn,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { logout, type Session } from "@/lib/auth";
import ThemeToggle from "@/components/theme-toggle";

const NAV_ITEMS: { label: string; icon: LucideIcon; href?: string }[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Reservations", icon: CalendarCheck, href: "/reservations" },
  { label: "Front Desk", icon: ConciergeBell },
  { label: "Room Service", icon: UtensilsCrossed },
  { label: "Housekeeping", icon: Sparkles },
  { label: "Billing", icon: Receipt },
  { label: "Reports", icon: ChartColumn },
  { label: "Settings", icon: Settings },
];

const ACTIVE_LABEL = "Reservations";

const STORAGE_KEY = "pms_sidebar_collapsed";

const EXPANDED_WIDTH = 256;
const COLLAPSED_WIDTH = 88;

const HOVER_TAP = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 350, damping: 30 },
} as const;

const fadeProps = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.15 },
};

export default function Sidebar({ session }: { session: Session }) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ type: "spring", stiffness: 400, damping: 34 }}
      className="flex min-h-screen shrink-0 flex-col justify-between bg-sidebar-fixed px-5 py-5"
    >
      <div>
        <div className="flex flex-col gap-3 pb-8">
          <div
            className={`flex items-center gap-[10px] ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            <div className="flex items-center gap-[10px]">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.3),0px_4px_6px_-4px_rgba(0,0,0,0.3)]">
                <Image
                  src="/reservations/icons/logo-mark.svg"
                  alt=""
                  width={16}
                  height={16}
                  className="invert"
                />
              </div>
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div key="brand" {...fadeProps} className="whitespace-nowrap">
                    <p className="text-[18px] font-medium leading-[28px] tracking-[-0.45px] text-white">
                      concierge
                    </p>
                    <p className="text-[9px] font-light uppercase leading-[13.5px] tracking-[0.45px] text-white/45">
                      Hotel Management
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.div key="theme-toggle" {...fadeProps}>
                  <ThemeToggle />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-center">
            <motion.button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              {...HOVER_TAP}
              className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
            >
              {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            </motion.button>
          </div>
        </div>

        <nav className="flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = item.label === ACTIVE_LABEL;
            const Icon = item.icon;
            const content = (
              <>
                <span className="flex size-4 shrink-0 items-center justify-center">
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      key="label"
                      {...fadeProps}
                      className={`whitespace-nowrap pl-3 text-sm ${
                        isActive ? "font-normal text-white" : "font-light text-white/45"
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !collapsed && (
                  <span className="ml-auto size-1 shrink-0 rounded-full bg-white" />
                )}
              </>
            );

            const className = `flex w-full items-center rounded-lg border p-[13px] transition-colors duration-200 ${
              collapsed ? "justify-center" : ""
            } ${
              isActive
                ? "border-white/10 bg-white/10 text-white"
                : "border-transparent text-white/45 hover:bg-white/5"
            }`;

            if (item.href) {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`${className} cursor-pointer`}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={item.label}
                title={collapsed ? item.label : undefined}
                className={className}
                aria-disabled
              >
                {content}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 pt-[21px]">
        <motion.button
          type="button"
          onClick={handleLogout}
          {...HOVER_TAP}
          className={`flex w-full cursor-pointer items-center gap-[10px] rounded-xl bg-white/5 p-3 transition-colors hover:bg-white/10 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span className="relative shrink-0">
            <span className="block size-10 overflow-hidden rounded-lg shadow-[0px_0px_0px_2px_rgba(255,255,255,0.15)]">
              <Image
                src={session.avatar}
                alt=""
                width={40}
                height={40}
                className="size-full object-cover"
              />
            </span>
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#0a0a0a] bg-white" />
          </span>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span key="account" {...fadeProps} className="flex-1 whitespace-nowrap text-left">
                <p className="text-xs leading-4 text-white">{session.name}</p>
                <p className="text-[10px] leading-[15px] font-light text-white/45">
                  {session.role}
                </p>
              </motion.span>
            )}
          </AnimatePresence>
          {!collapsed && <ChevronRight size={12} className="text-white/45" />}
        </motion.button>
      </div>
    </motion.aside>
  );
}
