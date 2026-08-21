export type Session = {
  email: string;
  name: string;
  role: string;
  avatar: string;
};

const SESSION_KEY = "pms_session";

// No backend yet — this is a single hardcoded demo account so the login
// form has something real to validate against until Supabase Auth lands.
const DEMO_USER = {
  email: "ana@concierge.com",
  password: "concierge123",
  name: "Ana Rodriguez",
  role: "Front Desk Manager",
  avatar: "/reservations/avatars/ana-rodriguez.png",
};

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function login(email: string, password: string): Session {
  if (
    email.trim().toLowerCase() !== DEMO_USER.email ||
    password !== DEMO_USER.password
  ) {
    throw new Error("Invalid email or password.");
  }

  const session: Session = {
    email: DEMO_USER.email,
    name: DEMO_USER.name,
    role: DEMO_USER.role,
    avatar: DEMO_USER.avatar,
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logout(): void {
  window.localStorage.removeItem(SESSION_KEY);
}
