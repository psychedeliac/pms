"use client";

import { useMemo, useState } from "react";
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
  Pencil,
  type LucideIcon,
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import WalkInBookingModal from "@/components/walk-in-booking-modal";
import AssignRoomModal from "@/components/assign-room-modal";
import EditReservationModal from "@/components/edit-reservation-modal";
import type { Profile } from "@/lib/profile";
import { getInitials } from "@/lib/profile";
import type { CheckInStatus, IdStatus, PaymentStatus, Reservation } from "@/lib/reservations";
import { setCheckInStatus, updateIdStatus, updatePaymentStatus } from "./actions";

const TABS = [
  { key: "check-in", label: "Check-In", icon: LogIn },
  { key: "check-out", label: "Check-Out", icon: LogOut },
  { key: "room-assignment", label: "Room Assignment", icon: DoorOpen },
  { key: "guest-profiles", label: "Guest Profiles", icon: Users },
  { key: "room-status", label: "Room Status", icon: ListChecks },
] as const;

const HOVER_TAP = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 350, damping: 30 },
} as const;

type TabKey = (typeof TABS)[number]["key"];

function isToday(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

type ReservationFilters = {
  idStatus: IdStatus | "all";
  paymentStatus: PaymentStatus | "all";
  checkInStatus: CheckInStatus | "all";
  vip: "all" | "vip" | "non-vip";
};

const DEFAULT_FILTERS: ReservationFilters = {
  idStatus: "all",
  paymentStatus: "all",
  checkInStatus: "all",
  vip: "all",
};

function matchesFilters(reservation: Reservation, filters: ReservationFilters): boolean {
  if (filters.idStatus !== "all" && reservation.idStatus !== filters.idStatus) return false;
  if (filters.paymentStatus !== "all" && reservation.paymentStatus !== filters.paymentStatus)
    return false;
  if (filters.checkInStatus !== "all" && reservation.checkInStatus !== filters.checkInStatus)
    return false;
  if (filters.vip !== "all" && reservation.isVip !== (filters.vip === "vip")) return false;
  return true;
}

const CSV_HEADERS = [
  "Booking Number",
  "Guest Name",
  "Room Type",
  "Room Number",
  "Arrival Time",
  "Nights",
  "ID Status",
  "Payment Status",
  "Check-In Status",
  "VIP",
];

function toCsvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function reservationsToCsv(reservations: Reservation[]): string {
  const rows = reservations.map((r) => [
    r.bookingNumber,
    r.guestName,
    r.roomType,
    r.roomNumber ?? "Unassigned",
    r.arrivalTime,
    String(r.nights),
    r.idStatus,
    r.paymentStatus,
    r.checkInStatus,
    r.isVip ? "Yes" : "No",
  ]);
  return [CSV_HEADERS, ...rows].map((row) => row.map(toCsvField).join(",")).join("\r\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

type StatusOption<T extends string> = {
  value: T;
  label: string;
  variant: "filled" | "outline";
  icon: LucideIcon;
};

const ID_STATUS_OPTIONS: StatusOption<IdStatus>[] = [
  { value: "verified", label: "Verified", variant: "filled", icon: BadgeCheck },
  { value: "pending", label: "Pending", variant: "outline", icon: Clock },
];

const PAYMENT_STATUS_OPTIONS: StatusOption<PaymentStatus>[] = [
  { value: "paid", label: "Paid", variant: "filled", icon: CircleCheck },
  { value: "pending", label: "Pending", variant: "outline", icon: Clock },
];

function StatusDropdown<T extends string>({
  value,
  options,
  disabled,
  onChange,
}: {
  value: T;
  options: StatusOption<T>[];
  disabled: boolean;
  onChange: (value: T) => void;
}) {
  const current = options.find((o) => o.value === value) ?? options[0];
  const Icon = current.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-[3.5px] text-xs ${
        current.variant === "filled"
          ? "bg-ink text-background"
          : "border border-border/20 text-muted"
      }`}
    >
      <Icon size={12} />
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        className="cursor-pointer appearance-none bg-transparent pr-1 text-xs text-inherit outline-none disabled:cursor-not-allowed"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-background text-ink">
            {option.label}
          </option>
        ))}
      </select>
    </span>
  );
}

function FilterPanel({
  filters,
  onChange,
  onClear,
  onClose,
}: {
  filters: ReservationFilters;
  onChange: (filters: ReservationFilters) => void;
  onClear: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15 }}
        className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-border/5 bg-surface p-4 backdrop-blur-[10px]"
      >
        <div className="flex flex-col gap-3">
          {(
            [
              {
                key: "idStatus" as const,
                label: "ID Status",
                options: [
                  { value: "all", label: "All" },
                  { value: "verified", label: "Verified" },
                  { value: "pending", label: "Pending" },
                ],
              },
              {
                key: "paymentStatus" as const,
                label: "Payment",
                options: [
                  { value: "all", label: "All" },
                  { value: "paid", label: "Paid" },
                  { value: "pending", label: "Pending" },
                ],
              },
              {
                key: "checkInStatus" as const,
                label: "Check-In",
                options: [
                  { value: "all", label: "All" },
                  { value: "checked-in", label: "Checked-In" },
                  { value: "pending", label: "Pending" },
                ],
              },
              {
                key: "vip" as const,
                label: "VIP",
                options: [
                  { value: "all", label: "All" },
                  { value: "vip", label: "VIP only" },
                  { value: "non-vip", label: "Non-VIP" },
                ],
              },
            ] as const
          ).map((group) => (
            <div key={group.key} className="flex flex-col gap-1">
              <label className="text-[10px] font-light uppercase text-muted">
                {group.label}
              </label>
              <select
                value={filters[group.key]}
                onChange={(e) => onChange({ ...filters, [group.key]: e.target.value })}
                className="cursor-pointer rounded-lg border border-border/5 bg-surface px-2.5 py-1.5 text-xs text-ink outline-none focus:border-ink/30"
              >
                {group.options.map((option) => (
                  <option key={option.value} value={option.value} className="bg-background text-ink">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer text-left text-xs text-muted transition-colors hover:text-ink"
          >
            Clear filters
          </button>
        </div>
      </motion.div>
    </>
  );
}

function AvatarCircle({ name }: { name: string }) {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-border/10 text-[10px] font-medium text-ink">
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
  const [assigningReservation, setAssigningReservation] = useState<Reservation | null>(null);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReservationFilters>(DEFAULT_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const filteredReservations = useMemo(
    () => reservations.filter((r) => matchesFilters(r, filters)),
    [reservations, filters]
  );
  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value !== "all"),
    [filters]
  );

  const statCards = useMemo(() => {
    const arrivalsToday = reservations.filter((r) => isToday(r.arrivalAt));
    const checkedInToday = arrivalsToday.filter((r) => r.checkInStatus === "checked-in");
    const earlyCheckIn = reservations.filter((r) => new Date(r.arrivalAt).getHours() < 14);
    const idPending = reservations.filter((r) => r.idStatus === "pending");
    const vipGuests = reservations.filter((r) => r.isVip);

    return [
      {
        icon: PlaneLanding,
        value: String(arrivalsToday.length),
        label: "Today's Arrivals",
        hint: `${checkedInToday.length} already checked-in`,
      },
      {
        icon: Clock,
        value: String(earlyCheckIn.length),
        label: "Early Check-In",
        hint: "Before 2:00 PM",
      },
      {
        icon: IdCard,
        value: String(idPending.length),
        label: "ID Pending",
        hint: "Verification required",
      },
      {
        icon: Star,
        value: String(vipGuests.length),
        label: "VIP Guests",
        hint: "Priority check-in",
      },
    ];
  }, [reservations]);

  async function handleCheckInStatusChange(id: string, status: Reservation["checkInStatus"]) {
    setActionError(null);
    const previous = reservations;
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, checkInStatus: status } : r))
    );

    const { error } = await setCheckInStatus(id, status);
    if (error) {
      setReservations(previous);
      setActionError(error);
    }
  }

  function handleRoomAssigned(id: string, roomNumber: string) {
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, roomNumber } : r))
    );
    setAssigningReservation(null);
  }

  function handleReservationSaved(
    id: string,
    patch: Pick<
      Reservation,
      | "guestName"
      | "roomType"
      | "roomNumber"
      | "nights"
      | "idStatus"
      | "paymentStatus"
      | "isVip"
      | "arrivalAt"
      | "arrivalTime"
    >
  ) {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setEditingReservation(null);
  }

  async function handleIdStatusChange(id: string, status: IdStatus) {
    setActionError(null);
    setPendingId(id);
    const previous = reservations;
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, idStatus: status } : r)));

    const { error } = await updateIdStatus(id, status);
    setPendingId(null);
    if (error) {
      setReservations(previous);
      setActionError(error);
    }
  }

  async function handlePaymentStatusChange(id: string, status: PaymentStatus) {
    setActionError(null);
    setPendingId(id);
    const previous = reservations;
    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, paymentStatus: status } : r))
    );

    const { error } = await updatePaymentStatus(id, status);
    setPendingId(null);
    if (error) {
      setReservations(previous);
      setActionError(error);
    }
  }

  function handleWalkInCreated(reservation: Reservation) {
    setReservations((prev) => [reservation, ...prev]);
  }

  function handleExport() {
    const csv = reservationsToCsv(filteredReservations);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`reservations-${date}.csv`, csv);
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex min-h-screen w-full bg-page-gradient">
      <Sidebar profile={profile} />

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
              onClick={() => setWalkInOpen(true)}
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
              {statCards.map((card, index) => {
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
                  <div className="relative">
                    <motion.button
                      type="button"
                      onClick={() => setFilterOpen((open) => !open)}
                      {...HOVER_TAP}
                      className={`flex cursor-pointer items-center gap-1 rounded-lg border px-3.5 py-1.5 text-xs backdrop-blur-[10px] transition-colors ${
                        hasActiveFilters
                          ? "border-ink bg-ink text-background"
                          : "border-border/5 bg-surface text-muted hover:bg-surface-hover hover:text-ink"
                      }`}
                    >
                      <ListFilter size={12} />
                      Filter
                    </motion.button>
                    <AnimatePresence>
                      {filterOpen && (
                        <FilterPanel
                          filters={filters}
                          onChange={setFilters}
                          onClear={() => setFilters(DEFAULT_FILTERS)}
                          onClose={() => setFilterOpen(false)}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                  <motion.button
                    type="button"
                    onClick={handleExport}
                    {...HOVER_TAP}
                    className="flex cursor-pointer items-center gap-1 rounded-lg border border-border/5 bg-surface px-3.5 py-1.5 text-xs text-muted backdrop-blur-[10px] transition-colors hover:bg-surface-hover hover:text-ink"
                  >
                    <Download size={12} />
                    Export
                  </motion.button>
                </div>
              </div>

              {actionError && (
                <p className="rounded-lg border border-border/20 px-3 py-2 text-xs font-normal text-ink">
                  {actionError}
                </p>
              )}

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
                    {filteredReservations.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-sm font-light text-muted">
                          No reservations match the current filters.
                        </td>
                      </tr>
                    )}
                    {filteredReservations.map((reservation) => {
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
                            <StatusDropdown
                              value={reservation.idStatus}
                              options={ID_STATUS_OPTIONS}
                              disabled={pendingId === reservation.id}
                              onChange={(status) =>
                                handleIdStatusChange(reservation.id, status)
                              }
                            />
                          </td>
                          <td className="py-4">
                            <StatusDropdown
                              value={reservation.paymentStatus}
                              options={PAYMENT_STATUS_OPTIONS}
                              disabled={pendingId === reservation.id}
                              onChange={(status) =>
                                handlePaymentStatusChange(reservation.id, status)
                              }
                            />
                          </td>
                          <td className="py-4">
                            <div className="flex items-center gap-1.5">
                            {isCheckedIn ? (
                              <motion.button
                                type="button"
                                onClick={() =>
                                  handleCheckInStatusChange(reservation.id, "pending")
                                }
                                {...HOVER_TAP}
                                className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-xs text-ink transition-colors hover:bg-border/5"
                                title="Click to revert to pending"
                              >
                                <CircleCheck size={12} />
                                Checked-In
                              </motion.button>
                            ) : reservation.roomNumber === null ? (
                              <motion.button
                                type="button"
                                onClick={() => setAssigningReservation(reservation)}
                                {...HOVER_TAP}
                                className="flex cursor-pointer items-center gap-1 rounded-lg border border-border/20 px-3 py-1.5 text-xs text-ink transition-colors hover:bg-border/5"
                              >
                                <DoorOpen size={13} />
                                Assign Room
                              </motion.button>
                            ) : (
                              <motion.button
                                type="button"
                                onClick={() =>
                                  handleCheckInStatusChange(reservation.id, "checked-in")
                                }
                                {...HOVER_TAP}
                                className="flex cursor-pointer items-center gap-1 rounded-lg bg-ink px-3 py-1.5 text-xs text-background transition-colors hover:bg-ink/85"
                              >
                                <LogIn size={12} />
                                Check-In
                              </motion.button>
                            )}
                            <button
                              type="button"
                              onClick={() => setEditingReservation(reservation)}
                              className="cursor-pointer rounded-lg p-1.5 text-muted transition-colors hover:bg-border/5 hover:text-ink"
                              title="Edit reservation"
                            >
                              <Pencil size={12} />
                            </button>
                            </div>
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

      <WalkInBookingModal
        open={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        onCreated={handleWalkInCreated}
      />

      <AssignRoomModal
        reservation={assigningReservation}
        onClose={() => setAssigningReservation(null)}
        onAssigned={handleRoomAssigned}
      />

      <EditReservationModal
        reservation={editingReservation}
        onClose={() => setEditingReservation(null)}
        onSaved={handleReservationSaved}
      />
    </div>
  );
}
