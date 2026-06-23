export function getUserInitials(
  name: string | null | undefined,
  email: string | null | undefined
) {
  if (name?.trim()) {
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  if (email?.trim()) {
    return email.slice(0, 2).toUpperCase();
  }

  return "U";
}

export function getUserDisplayName(
  name: string | null | undefined,
  email: string | null | undefined
) {
  return name?.trim() || email?.split("@")[0] || "User";
}
