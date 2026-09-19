export function getSafeRedirect(path: unknown, fallback = "/admin") {
  if (typeof path !== "string") {
    return fallback;
  }

  const trimmed = path.trim();

  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("://")) {
    return fallback;
  }

  if (trimmed === "/dashboard" || trimmed.startsWith("/dashboard/")) {
    return trimmed.replace(/^\/dashboard/, "/admin");
  }

  return trimmed;
}
