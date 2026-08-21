export type IdStatus = "verified" | "pending";
export type PaymentStatus = "paid" | "pending";
export type CheckInStatus = "pending" | "checked-in";

export type Reservation = {
  id: string;
  bookingNumber: string;
  guestName: string;
  avatar: string;
  roomType: string;
  roomNumber: string | null;
  arrivalTime: string;
  nights: number;
  idStatus: IdStatus;
  paymentStatus: PaymentStatus;
  checkInStatus: CheckInStatus;
};

const STORAGE_KEY = "pms_reservations";

const SEED_RESERVATIONS: Reservation[] = [
  {
    id: "4521",
    bookingNumber: "#4521",
    guestName: "Johnathan Miller",
    avatar: "/reservations/avatars/johnathan-miller.png",
    roomType: "King Suite",
    roomNumber: "302",
    arrivalTime: "2:00 PM",
    nights: 3,
    idStatus: "pending",
    paymentStatus: "paid",
    checkInStatus: "pending",
  },
  {
    id: "4522",
    bookingNumber: "#4522",
    guestName: "Samantha Davis",
    avatar: "/reservations/avatars/samantha-davis.png",
    roomType: "Deluxe Queen",
    roomNumber: null,
    arrivalTime: "3:00 PM",
    nights: 5,
    idStatus: "verified",
    paymentStatus: "pending",
    checkInStatus: "pending",
  },
  {
    id: "4520",
    bookingNumber: "#4520",
    guestName: "Michael Chen",
    avatar: "/reservations/avatars/michael-chen.png",
    roomType: "Std. Double",
    roomNumber: "105",
    arrivalTime: "1:30 PM",
    nights: 2,
    idStatus: "verified",
    paymentStatus: "paid",
    checkInStatus: "checked-in",
  },
];

export function getReservations(): Reservation[] {
  if (typeof window === "undefined") return SEED_RESERVATIONS;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_RESERVATIONS));
    return SEED_RESERVATIONS;
  }
  try {
    return JSON.parse(raw) as Reservation[];
  } catch {
    return SEED_RESERVATIONS;
  }
}

export function checkInGuest(id: string): Reservation[] {
  const updated = getReservations().map((r) =>
    r.id === id ? { ...r, checkInStatus: "checked-in" as const } : r
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
