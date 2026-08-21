import type { User } from "@supabase/supabase-js";

export type Profile = {
  email: string;
  name: string;
  role: string;
  initials: string;
};

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
  return (first + last).toUpperCase();
}

export function toProfile(user: User): Profile {
  const name =
    typeof user.user_metadata?.name === "string" && user.user_metadata.name
      ? user.user_metadata.name
      : user.email ?? "Unknown";
  const role =
    typeof user.user_metadata?.role === "string" && user.user_metadata.role
      ? user.user_metadata.role
      : "Staff";

  return {
    email: user.email ?? "",
    name,
    role,
    initials: getInitials(name),
  };
}
