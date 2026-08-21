import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { toProfile } from "@/lib/profile";
import { getReservations } from "@/lib/reservations";
import ReservationsView from "./reservations-view";

export const dynamic = "force-dynamic";

export default async function ReservationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profile = toProfile(user);
  const reservations = await getReservations();

  return <ReservationsView profile={profile} initialReservations={reservations} />;
}
