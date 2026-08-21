"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import Sidebar from "@/components/sidebar";
import WalkInBookingModal from "@/components/walk-in-booking-modal";
import type { Profile } from "@/lib/profile";
import { getInitials } from "@/lib/profile";
import type { Reservation } from "@/lib/reservations";
import { checkInGuest } from "./actions";

const TABS = [
  { key: "check-in", label: "Check-In", icon: "/reservations/icons/tab-checkin.svg" },
  { key: "check-out", label: "Check-Out", icon: "/reservations/icons/tab-checkout.svg" },
  {
    key: "room-assignment",
    label: "Room Assignment",
    icon: "/reservations/icons/tab-room-assignment.svg",
  },
  {
    key: "guest-profiles",
    label: "Guest Profiles",
    icon: "/reservations/icons/tab-guest-profiles.svg",
  },
  {
    key: "room-status",
    label: "Room Status",
    icon: "/reservations/icons/tab-room-status.svg",
  },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

function Badge({
  icon,
  label,
  color,
  bg,
}: {
  icon: string;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-2 py-[3.5px] text-xs"
      style={{ backgroundColor: bg, color }}
    >
      <Image src={icon} alt="" width={12} height={12} />
      {label}
    </span>
  );
}

function AvatarCircle({ name }: { name: string }) {
  return (
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-medium text-white"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgb(16, 185, 129) 0%, rgb(5, 150, 105) 100%)",
      }}
    >
      {getInitials(name)}
    </span>
  );
}

export default function ReservationsView({
  profile,
  initialReservations,
}: {
  profile: Profile;
  initialReservations: Reservation[];
}) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [activeTab, setActiveTab] = useState<TabKey>("check-in");
  const [walkInOpen, setWalkInOpen] = useState(false);
  const [checkInError, setCheckInError] = useState<string | null>(null);

  const statCards = useMemo(() => {
    const arrivalsToday = reservations.filter((r) => isToday(r.arrivalAt));
    const checkedInToday = arrivalsToday.filter((r) => r.checkInStatus === "checked-in");
    const earlyCheckIn = reservations.filter((r) => new Date(r.arrivalAt).getHours() < 14);
    const idPending = reservations.filter((r) => r.idStatus === "pending");
    const vipGuests = reservations.filter((r) => r.isVip);

    return [
      {
        icon: "/reservations/icons/stat-arrivals.svg",
        tint: "rgba(16,185,129,0.1)",
        value: String(arrivalsToday.length),
        label: "Today's Arrivals",
        hint: `${checkedInToday.length} already checked-in`,
      },
      {
        icon: "/reservations/icons/stat-early-checkin.svg",
        tint: "rgba(234,179,8,0.1)",
        value: String(earlyCheckIn.length),
        label: "Early Check-In",
        hint: "Before 2:00 PM",
      },
      {
        icon: "/reservations/icons/stat-id-pending.svg",
        tint: "rgba(168,85,247,0.1)",
        value: String(idPending.length),
        label: "ID Pending",
        hint: "Verification required",
      },
      {
        icon: "/reservations/icons/stat-vip.svg",
        tint: "rgba(59,130,246,0.1)",
        value: String(vipGuests.length),
        label: "VIP Guests",
        hint: "Priority check-in",
      },
    ];
  }, [reservations]);

  async function handleCheckIn(id: string) {
    setCheckInError(null);
    const previous = reservations;
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, checkInStatus: "checked-in" as const } : r))
    );

    const { error } = await checkInGuest(id);
    if (error) {
      setReservations(previous);
      setCheckInError(error);
    }
  }

  function handleWalkInCreated(reservation: Reservation) {
    setReservations((prev) => [reservation, ...prev]);
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className="flex min-h-screen w-full"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgb(10, 10, 10) 0%, rgb(13, 13, 13) 100%)",
      }}
    >
      <Sidebar profile={profile} />

      <main className="flex w-full flex-1 flex-col gap-6 overflow-auto p-6">
        <header className="flex w-full items-center justify-between">
          <div>
            <h1 className="text-xl font-medium tracking-[-0.5px] text-white">
              Reservations
            </h1>
            <p className="text-xs font-light text-[#9ca3af]">
              {today} • Manage guest bookings, arrivals & room assignments
            </p>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              onClick={() => setWalkInOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-gradient-to-r from-[#10b981] to-[#059669] px-4 py-2 text-xs text-white shadow-[0px_10px_15px_-3px_rgba(16,185,129,0.2),0px_4px_6px_-4px_rgba(16,185,129,0.2)]"
            >
              <Image
                src="/reservations/icons/icon-plus.svg"
                alt=""
                width={13}
                height={12}
              />
              Walk-in Booking
            </motion.button>

            <div className="relative">
              <Image
                src="/reservations/icons/icon-search.svg"
                alt=""
                width={12}
                height={12}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Search guests, rooms..."
                className="w-64 rounded-lg border border-white/5 bg-[rgba(26,26,26,0.6)] py-2.5 pl-10 pr-4 text-xs text-white outline-none transition-colors placeholder:text-[#9ca3af] backdrop-blur-[10px] focus:border-[#10b981]"
              />
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="relative flex cursor-pointer items-center justify-center rounded-lg border border-white/5 bg-[rgba(26,26,26,0.6)] p-3 backdrop-blur-[10px] transition-colors hover:bg-[rgba(26,26,26,0.9)]"
            >
              <Image
                src="/reservations/icons/icon-bell.svg"
                alt="Notifications"
                width={12}
                height={14}
              />
              <span className="absolute right-1 top-1 size-2 rounded-full bg-[#10b981] shadow-[0px_0px_0px_2px_#1a1a1a]" />
            </motion.button>
          </div>
        </header>

        <nav className="flex w-full items-start border-b border-white/10 pb-px">
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex cursor-pointer items-center gap-2 px-1 pb-3.5 text-sm transition-colors first:pl-0 [&:not(:first-child)]:ml-6 ${
                  isActive ? "text-white" : "font-light text-[#9ca3af] hover:text-white"
                }`}
              >
                <Image src={tab.icon} alt="" width={14} height={14} />
                {tab.label}
                {isActive && (
                  <motion.span
                    layoutId="active-tab-indicator"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-[#10b981]"
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
              {statCards.map((card, index) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex flex-1 flex-col gap-1 rounded-xl border border-white/5 bg-[rgba(26,26,26,0.6)] p-[17px] backdrop-blur-[10px]"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="flex size-10 items-center justify-center rounded-lg"
                      style={{ backgroundColor: card.tint }}
                    >
                      <Image src={card.icon} alt="" width={16} height={16} />
                    </span>
                    <span className="text-2xl font-semibold text-white">
                      {card.value}
                    </span>
                  </div>
                  <p className="pt-1 text-sm text-white">{card.label}</p>
                  <p className="text-xs font-light text-[#9ca3af]">{card.hint}</p>
                </motion.div>
              ))}
            </div>

            <section className="flex w-full flex-col gap-4 rounded-xl border border-white/5 bg-[rgba(26,26,26,0.6)] p-[21px] backdrop-blur-[10px]">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image
                    src="/reservations/icons/heading-list.svg"
                    alt=""
                    width={20}
                    height={16}
                  />
                  <h2 className="text-base font-medium text-white">
                    Guest Arrivals Today
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="flex cursor-pointer items-center gap-1 rounded-lg border border-white/5 bg-[rgba(26,26,26,0.6)] px-3.5 py-1.5 text-xs text-[#9ca3af] backdrop-blur-[10px] transition-colors hover:bg-[rgba(26,26,26,0.9)] hover:text-white"
                  >
                    <Image
                      src="/reservations/icons/icon-filter.svg"
                      alt=""
                      width={12}
                      height={12}
                    />
                    Filter
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="flex cursor-pointer items-center gap-1 rounded-lg border border-white/5 bg-[rgba(26,26,26,0.6)] px-3.5 py-1.5 text-xs text-[#9ca3af] backdrop-blur-[10px] transition-colors hover:bg-[rgba(26,26,26,0.9)] hover:text-white"
                  >
                    <Image
                      src="/reservations/icons/icon-export.svg"
                      alt=""
                      width={12}
                      height={12}
                    />
                    Export
                  </motion.button>
                </div>
              </div>

              {checkInError && (
                <p className="text-xs font-light text-[#f87171]">{checkInError}</p>
              )}

              <div className="w-full overflow-auto">
                <table className="w-full min-w-[900px] border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
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
                          className="pb-3 text-left text-xs font-light uppercase text-[#9ca3af]"
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
                          className={`border-b border-white/5 transition-colors hover:bg-white/[0.03] ${
                            isCheckedIn ? "bg-[rgba(20,83,45,0.1)]" : ""
                          }`}
                        >
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              {reservation.avatar ? (
                                <span className="block size-8 shrink-0 overflow-hidden rounded-full">
                                  <Image
                                    src={reservation.avatar}
                                    alt=""
                                    width={32}
                                    height={32}
                                    className="size-full object-cover"
                                  />
                                </span>
                              ) : (
                                <AvatarCircle name={reservation.guestName} />
                              )}
                              <div>
                                <p className="text-sm text-white">
                                  {reservation.guestName}
                                </p>
                                <p className="text-xs text-[#9ca3af]">
                                  Booking {reservation.bookingNumber}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-sm font-light text-[#9ca3af]">
                            {reservation.roomType}
                            {reservation.roomNumber
                              ? ` - ${reservation.roomNumber}`
                              : " - Unassigned"}
                          </td>
                          <td className="py-4 text-sm font-light text-[#9ca3af]">
                            {reservation.arrivalTime}
                          </td>
                          <td className="py-4 text-sm font-light text-[#9ca3af]">
                            {reservation.nights} nights
                          </td>
                          <td className="py-4">
                            {reservation.idStatus === "verified" ? (
                              <Badge
                                icon="/reservations/icons/badge-verified.svg"
                                label="Verified"
                                color="#10b981"
                                bg="rgba(16,185,129,0.2)"
                              />
                            ) : (
                              <Badge
                                icon="/reservations/icons/badge-pending-id.svg"
                                label="Pending"
                                color="#facc15"
                                bg="rgba(234,179,8,0.2)"
                              />
                            )}
                          </td>
                          <td className="py-4">
                            {reservation.paymentStatus === "paid" ? (
                              <Badge
                                icon="/reservations/icons/badge-check.svg"
                                label="Paid"
                                color="#10b981"
                                bg="rgba(16,185,129,0.2)"
                              />
                            ) : (
                              <Badge
                                icon="/reservations/icons/badge-pending-payment.svg"
                                label="Pending"
                                color="#f87171"
                                bg="rgba(239,68,68,0.2)"
                              />
                            )}
                          </td>
                          <td className="py-4">
                            {isCheckedIn ? (
                              <span className="flex items-center gap-1 text-xs text-[#10b981]">
                                <Image
                                  src="/reservations/icons/badge-check.svg"
                                  alt=""
                                  width={12}
                                  height={12}
                                />
                                Checked-In
                              </span>
                            ) : reservation.roomNumber === null ? (
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                className="flex cursor-pointer items-center gap-1 rounded-lg bg-[rgba(168,85,247,0.2)] px-3 py-1.5 text-xs text-[#c084fc] transition-colors hover:bg-[rgba(168,85,247,0.3)]"
                              >
                                <Image
                                  src="/reservations/icons/action-assign-room.svg"
                                  alt=""
                                  width={13.5}
                                  height={12}
                                />
                                Assign Room
                              </motion.button>
                            ) : (
                              <motion.button
                                type="button"
                                onClick={() => handleCheckIn(reservation.id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                className="flex cursor-pointer items-center gap-1 rounded-lg bg-[rgba(16,185,129,0.2)] px-3 py-1.5 text-xs text-[#10b981] transition-colors hover:bg-[rgba(16,185,129,0.3)]"
                              >
                                <Image
                                  src="/reservations/icons/action-checkin.svg"
                                  alt=""
                                  width={12}
                                  height={12}
                                />
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
            className="flex w-full flex-1 items-center justify-center rounded-xl border border-white/5 bg-[rgba(26,26,26,0.6)] p-12 backdrop-blur-[10px]"
          >
            <p className="text-sm font-light text-[#9ca3af]">
              {TABS.find((t) => t.key === activeTab)?.label} view coming soon.
            </p>
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      <WalkInBookingModal
        open={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        onCreated={handleWalkInCreated}
      />
    </div>
  );
}
