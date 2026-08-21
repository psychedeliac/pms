"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { assignRoom } from "@/app/reservations/actions";
import type { Reservation } from "@/lib/reservations";

export default function AssignRoomModal({
  reservation,
  onClose,
  onAssigned,
}: {
  reservation: Reservation | null;
  onClose: () => void;
  onAssigned: (id: string, roomNumber: string) => void;
}) {
  const [roomNumber, setRoomNumber] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    setRoomNumber("");
    setError(null);
    onClose();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!reservation) return;

    setPending(true);
    setError(null);

    const { error } = await assignRoom(reservation.id, roomNumber);
    setPending(false);

    if (error) {
      setError(error);
      return;
    }

    onAssigned(reservation.id, roomNumber);
    setRoomNumber("");
  }

  return (
    <AnimatePresence>
      {reservation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm rounded-xl border border-border/5 bg-surface p-8 backdrop-blur-[10px]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-1 text-lg font-medium text-ink">Assign Room</h2>
            <p className="mb-6 text-xs font-light text-muted">
              {reservation.guestName} • {reservation.roomType}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="assignRoomNumber" className="text-xs font-light text-muted">
                  Room Number
                </label>
                <input
                  id="assignRoomNumber"
                  type="text"
                  required
                  autoFocus
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="rounded-lg border border-border/5 bg-surface px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-ink/30"
                  placeholder="e.g. 214"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-border/20 px-3 py-2 text-xs font-normal text-ink">
                  {error}
                </p>
              )}

              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
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
                  {pending ? "Assigning..." : "Assign"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
