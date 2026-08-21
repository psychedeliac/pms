"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { toReservation, type Reservation, type PaymentStatus } from "@/lib/reservations";

export async function checkInGuest(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("reservations")
    .update({ check_in_status: "checked-in" })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/reservations");
  return { error: null };
}

export async function createWalkInBooking(input: {
  guestName: string;
  roomType: string;
  roomNumber: string | null;
  nights: number;
  paymentStatus: PaymentStatus;
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
    })
    .select()
    .single();

  if (error) return { error: error.message, reservation: null };

  revalidatePath("/reservations");
  return { error: null, reservation: toReservation(data) };
}
