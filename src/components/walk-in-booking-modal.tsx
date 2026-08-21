"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createWalkInBooking } from "@/app/reservations/actions";
import type { PaymentStatus, Reservation } from "@/lib/reservations";
import { isoToTimeInput, timeInputToIsoToday } from "@/lib/reservation-time";

export default function WalkInBookingModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (reservation: Reservation) => void;
}) {
  const [guestName, setGuestName] = useState("");
  const [roomType, setRoomType] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [nights, setNights] = useState(1);
  const [arrivalTime, setArrivalTime] = useState(() => isoToTimeInput(new Date().toISOString()));
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setGuestName("");
    setRoomType("");
    setRoomNumber("");
    setNights(1);
    setArrivalTime(isoToTimeInput(new Date().toISOString()));
    setPaymentStatus("pending");
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const { error, reservation } = await createWalkInBooking({
      guestName,
      roomType,
      roomNumber: roomNumber.trim() === "" ? null : roomNumber,
      nights,
      paymentStatus,
      arrivalAt: timeInputToIsoToday(arrivalTime),
    });

    setPending(false);

    if (error || !reservation) {
      setError(error ?? "Something went wrong.");
      return;
    }

    onCreated(reservation);
    reset();
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm rounded-xl border border-border/5 bg-surface p-8 backdrop-blur-[10px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-6 text-lg font-medium text-ink">Walk-in Booking</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="guestName" className="text-xs font-light text-muted">
                  Guest Name
                </label>
                <input
                  id="guestName"
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="rounded-lg border border-border/5 bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink/30"
                  placeholder="Jane Doe"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="roomType" className="text-xs font-light text-muted">
                  Room Type
                </label>
                <input
                  id="roomType"
                  type="text"
                  required
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="rounded-lg border border-border/5 bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink/30"
                  placeholder="King Suite"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="roomNumber" className="text-xs font-light text-muted">
                  Room Number
                </label>
                <input
                  id="roomNumber"
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="rounded-lg border border-border/5 bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink/30"
                  placeholder="Unassigned"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label htmlFor="arrivalTime" className="text-xs font-light text-muted">
                    Arrival Time
                  </label>
                  <input
                    id="arrivalTime"
                    type="time"
                    required
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="rounded-lg border border-border/5 bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink/30"
                  />
                </div>

                <div className="flex w-24 flex-col gap-1.5">
                  <label htmlFor="nights" className="text-xs font-light text-muted">
                    Nights
                  </label>
                  <input
                    id="nights"
                    type="number"
                    min={1}
                    required
                    value={nights}
                    onChange={(e) => setNights(Math.max(1, Number(e.target.value)))}
                    className="rounded-lg border border-border/5 bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink/30"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-light text-muted">Payment</span>
                <div className="flex gap-2">
                  {(["pending", "paid"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setPaymentStatus(status)}
                      className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-xs capitalize transition-colors ${
                        paymentStatus === status
                          ? "border-ink bg-ink text-background"
                          : "border-border/5 bg-surface text-muted hover:text-ink"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="rounded-lg border border-border/20 px-3 py-2 text-xs font-normal text-ink">
                  {error}
                </p>
              )}

              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 cursor-pointer rounded-lg border border-border/5 bg-surface py-2.5 text-sm text-muted transition-colors hover:text-ink"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  disabled={pending}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="flex-1 cursor-pointer rounded-lg bg-ink py-2.5 text-sm font-normal text-background shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.15),0px_4px_6px_-4px_rgba(0,0,0,0.15)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pending ? "Booking..." : "Book"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
