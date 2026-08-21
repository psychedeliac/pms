import { createClient } from "@/lib/supabase/server";

export type IdStatus = "verified" | "pending";
export type PaymentStatus = "paid" | "pending";
export type CheckInStatus = "pending" | "checked-in";

export type Reservation = {
  id: string;
  bookingNumber: string;
  guestName: string;
  avatar: string | null;
  roomType: string;
  roomNumber: string | null;
  arrivalTime: string;
  arrivalAt: string;
  nights: number;
  idStatus: IdStatus;
  paymentStatus: PaymentStatus;
  checkInStatus: CheckInStatus;
  isVip: boolean;
};

type ReservationRow = {
  id: string;
  booking_no: number;
  guest_name: string;
  avatar_url: string | null;
  room_type: string;
  room_number: string | null;
  arrival_at: string;
  nights: number;
  id_status: IdStatus;
  payment_status: PaymentStatus;
  check_in_status: CheckInStatus;
  is_vip: boolean;
};

export function toReservation(row: ReservationRow): Reservation {
  return {
    id: row.id,
    bookingNumber: `#${row.booking_no}`,
    guestName: row.guest_name,
    avatar: row.avatar_url,
    roomType: row.room_type,
    roomNumber: row.room_number,
    arrivalTime: new Date(row.arrival_at).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
    arrivalAt: row.arrival_at,
    nights: row.nights,
    idStatus: row.id_status,
    paymentStatus: row.payment_status,
    checkInStatus: row.check_in_status,
    isVip: row.is_vip,
  };
}

export async function getReservations(): Promise<Reservation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .order("arrival_at");

  if (error) throw error;
  return (data as ReservationRow[]).map(toReservation);
}
