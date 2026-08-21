"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  LogIn,
  LogOut,
  DoorOpen,
  Users,
  ListChecks,
  PlaneLanding,
  Clock,
  IdCard,
  Star,
  Plus,
  Search,
  Bell,
  ListFilter,
  Download,
  ClipboardList,
  BadgeCheck,
  CircleCheck,
  type LucideIcon,
} from "lucide-react";
import RequireAuth from "@/components/require-auth";
import Sidebar from "@/components/sidebar";
import type { Session } from "@/lib/auth";
import {
  checkInGuest,
  getReservations,
  type Reservation,
} from "@/lib/reservations";

const TABS = [
  { key: "check-in", label: "Check-In", icon: LogIn },
  { key: "check-out", label: "Check-Out", icon: LogOut },
  { key: "room-assignment", label: "Room Assignment", icon: DoorOpen },
  { key: "guest-profiles", label: "Guest Profiles", icon: Users },
  { key: "room-status", label: "Room Status", icon: ListChecks },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const HOVER_TAP = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 350, damping: 30 },
} as const;

const STAT_CARDS = [
  {
    icon: PlaneLanding,
    value: "15",
    label: "Today's Arrivals",
    hint: "3 already checked-in",
  },
  {
    icon: Clock,
    value: "8",
    label: "Early Check-In",
    hint: "Before 2:00 PM",
  },
  {
    icon: IdCard,
    value: "5",
    label: "ID Pending",
    hint: "Verification required",
  },
  {
    icon: Star,
    value: "2",
    label: "VIP Guests",
    hint: "Priority check-in",
  },
];

function Badge({
  icon: Icon,
  label,
  variant,
}: {
  icon: LucideIcon;
  label: string;
  variant: "filled" | "outline";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-[3.5px] text-xs ${
        variant === "filled"
          ? "bg-ink text-background"
          : "border border-border/20 text-muted"
      }`}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}

function ReservationsView({ session }: { session: Session }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("check-in");

  useEffect(() => {
    // localStorage is unavailable during SSR, so this must run post-mount to
    // avoid a hydration mismatch — not a candidate for a derived/lazy value.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReservations(getReservations());
  }, []);

  function handleCheckIn(id: string) {
    setReservations(checkInGuest(id));
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-screen w-full bg-page-gradient">
      <Sidebar session={session} />

      <main className="flex w-full flex-1 flex-col gap-6 overflow-auto p-6">
        <header className="flex w-full items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink">
              Reservations
            </h1>
            <p className="text-xs font-light text-muted">
              {today} • Manage guest bookings, arrivals & room assignments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              {...HOVER_TAP}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-ink px-4 py-2 text-xs text-background shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.15),0px_4px_6px_-4px_rgba(0,0,0,0.15)]"
            >
              <Plus size={13} />
              Walk-in Booking
            </motion.button>

            <div className="relative">
              <Search
                size={12}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                placeholder="Search guests, rooms..."
                className="w-64 rounded-lg border border-border/5 bg-surface py-2.5 pl-10 pr-4 text-xs text-ink outline-none transition-colors placeholder:text-muted backdrop-blur-[10px] focus:border-ink/30"
              />
            </div>

            <motion.button
              type="button"
              {...HOVER_TAP}
              className="relative flex cursor-pointer items-center justify-center rounded-lg border border-border/5 bg-surface p-3 backdrop-blur-[10px] transition-colors hover:bg-surface-hover"
            >
              <Bell size={12} className="text-muted" aria-label="Notifications" />
              <span className="absolute right-1 top-1 size-2 rounded-full bg-ink shadow-[0px_0px_0px_2px_var(--background)]" />
            </motion.button>
          </div>
        </header>

        <nav className="flex w-full items-start border-b border-border/10 pb-px">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex cursor-pointer items-center gap-2 px-1 pb-3.5 text-sm transition-colors first:pl-0 [&:not(:first-child)]:ml-6 ${
                  isActive ? "text-ink" : "font-light text-muted hover:text-ink"
                }`}
              >
                <TabIcon size={14} />
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="active-tab-indicator"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-ink"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <AnimatePresence mode="wait">
        {activeTab === "check-in" ? (
          <motion.div
            key="check-in"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full flex-col gap-6"
          >
            <div className="flex w-full gap-4">
              {STAT_CARDS.map((card, index) => {
                const StatIcon = card.icon;
                return (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex flex-1 flex-col gap-1 rounded-xl border border-border/5 bg-surface p-[17px] backdrop-blur-[10px]"
                  >
                    <div className="flex items-start justify-between">
                      <span className="flex size-10 items-center justify-center rounded-lg bg-border/5 text-ink">
                        <StatIcon size={16} strokeWidth={1.75} />
                      </span>
                      <span className="text-2xl font-semibold text-ink">
                        {card.value}
                      </span>
                    </div>
                    <p className="pt-1 text-sm text-ink">{card.label}</p>
                    <p className="text-xs font-light text-muted">{card.hint}</p>
                  </motion.div>
                );
              })}
            </div>

            <section className="flex w-full flex-col gap-4 rounded-xl border border-border/5 bg-surface p-[21px] backdrop-blur-[10px]">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList size={18} className="text-ink" />
                  <h2 className="text-base font-medium text-ink">
                    Guest Arrivals Today
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    {...HOVER_TAP}
                    className="flex cursor-pointer items-center gap-1 rounded-lg border border-border/5 bg-surface px-3.5 py-1.5 text-xs text-muted backdrop-blur-[10px] transition-colors hover:bg-surface-hover hover:text-ink"
                  >
                    <ListFilter size={12} />
                    Filter
                  </motion.button>
                  <motion.button
                    type="button"
                    {...HOVER_TAP}
                    className="flex cursor-pointer items-center gap-1 rounded-lg border border-border/5 bg-surface px-3.5 py-1.5 text-xs text-muted backdrop-blur-[10px] transition-colors hover:bg-surface-hover hover:text-ink"
                  >
                    <Download size={12} />
                    Export
                  </motion.button>
                </div>
              </div>

              <div className="w-full overflow-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr className="border-b border-border/10">
                      {[
                        "Guest Name",
                        "Room Type",
                        "Arrival Time",
                        "Nights",
                        "ID Status",
                        "Payment",
                        "Actions",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="pb-3 text-left text-xs font-light uppercase text-muted"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((reservation) => {
                      const isCheckedIn = reservation.checkInStatus === "checked-in";
                      return (
                        <tr
                          key={reservation.id}
                          className={`border-b border-border/5 transition-colors hover:bg-border/[0.03] ${
                            isCheckedIn ? "bg-ink/5" : ""
                          }`}
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <span className="block size-8 shrink-0 overflow-hidden rounded-full">
                                <Image
                                  src={reservation.avatar}
                                  alt=""
                                  width={32}
                                  height={32}
                                  className="size-full object-cover"
                                />
                              </span>
                              <div>
                                <p className="text-sm text-ink">
                                  {reservation.guestName}
                                </p>
                                <p className="text-xs text-muted">
                                  Booking {reservation.bookingNumber}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-sm font-light text-muted">
                            {reservation.roomType}
                            {reservation.roomNumber
                              ? ` - ${reservation.roomNumber}`
                              : " - Unassigned"}
                          </td>
                          <td className="py-4 text-sm font-light text-muted">
                            {reservation.arrivalTime}
                          </td>
                          <td className="py-4 text-sm font-light text-muted">
                            {reservation.nights} nights
                          </td>
                          <td className="py-4">
                            {reservation.idStatus === "verified" ? (
                              <Badge icon={BadgeCheck} label="Verified" variant="filled" />
                            ) : (
                              <Badge icon={Clock} label="Pending" variant="outline" />
                            )}
                          </td>
                          <td className="py-4">
                            {reservation.paymentStatus === "paid" ? (
                              <Badge icon={CircleCheck} label="Paid" variant="filled" />
                            ) : (
                              <Badge icon={Clock} label="Pending" variant="outline" />
                            )}
                          </td>
                          <td className="py-4">
                            {isCheckedIn ? (
                              <span className="flex items-center gap-1 text-xs text-ink">
                                <CircleCheck size={12} />
                                Checked-In
                              </span>
                            ) : reservation.roomNumber === null ? (
                              <motion.button
                                type="button"
                                {...HOVER_TAP}
                                className="flex cursor-pointer items-center gap-1 rounded-lg border border-border/20 px-3 py-1.5 text-xs text-ink transition-colors hover:bg-border/5"
                              >
                                <DoorOpen size={13} />
                                Assign Room
                              </motion.button>
                            ) : (
                              <motion.button
                                type="button"
                                onClick={() => handleCheckIn(reservation.id)}
                                {...HOVER_TAP}
                                className="flex cursor-pointer items-center gap-1 rounded-lg bg-ink px-3 py-1.5 text-xs text-background transition-colors hover:bg-ink/85"
                              >
                                <LogIn size={12} />
                                Check-In
                              </motion.button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex w-full flex-1 items-center justify-center rounded-xl border border-border/5 bg-surface p-12 backdrop-blur-[10px]"
          >
            <p className="text-sm font-light text-muted">
              {TABS.find((t) => t.key === activeTab)?.label} view coming soon.
            </p>
          </motion.div>
        )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function ReservationsPage() {
  return (
    <RequireAuth>{(session) => <ReservationsView session={session} />}</RequireAuth>
  );
}
