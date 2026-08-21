"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  toReservation,
  type Reservation,
  type CheckInStatus,
  type IdStatus,
  type PaymentStatus,
} from "@/lib/reservations";

async function updateReservation(
  id: string,
  patch: Record<string, unknown>
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("reservations").update(patch).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/reservations");
  return { error: null };
}

export async function setCheckInStatus(
  id: string,
  status: CheckInStatus
): Promise<{ error: string | null }> {
  return updateReservation(id, { check_in_status: status });
}

export async function assignRoom(
  id: string,
  roomNumber: string
): Promise<{ error: string | null }> {
  return updateReservation(id, { room_number: roomNumber });
}

export async function updateIdStatus(
  id: string,
  status: IdStatus
): Promise<{ error: string | null }> {
  return updateReservation(id, { id_status: status });
}

export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus
): Promise<{ error: string | null }> {
  return updateReservation(id, { payment_status: status });
}

export async function editReservation(
  id: string,
  input: {
    guestName: string;
    roomType: string;
    roomNumber: string | null;
    nights: number;
    idStatus: IdStatus;
    paymentStatus: PaymentStatus;
    isVip: boolean;
    arrivalAt: string;
  }
): Promise<{ error: string | null }> {
  return updateReservation(id, {
    guest_name: input.guestName,
    room_type: input.roomType,
    room_number: input.roomNumber,
    nights: input.nights,
    id_status: input.idStatus,
    payment_status: input.paymentStatus,
    is_vip: input.isVip,
    arrival_at: input.arrivalAt,
  });
}

export async function createWalkInBooking(input: {
  guestName: string;
  roomType: string;
  roomNumber: string | null;
  nights: number;
  paymentStatus: PaymentStatus;
  arrivalAt: string;
}): Promise<{ error: string | null; reservation: Reservation | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", reservation: null };

  const { data, error } = await supabase
    .from("reservations")
    .insert({
      guest_name: input.guestName,
      room_type: input.roomType,
      room_number: input.roomNumber,
      nights: input.nights,
      payment_status: input.paymentStatus,
      arrival_at: input.arrivalAt,
    })
    .select()
    .single();

  if (error) return { error: error.message, reservation: null };

  revalidatePath("/reservations");
  return { error: null, reservation: toReservation(data) };
}
