export function getProjectRef(supabaseUrl?: string) {
  if (!supabaseUrl) {
    return "";
  }

  try {
    return new URL(supabaseUrl).hostname.split(".")[0] ?? "";
  } catch {
    return "";
  }
}

export function buildDatabaseUrl() {
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const configured = process.env.DATABASE_URL?.trim();

  if (configured?.includes("[YOUR-PASSWORD]")) {
    if (!password) {
      return "";
    }

    return configured.replaceAll("[YOUR-PASSWORD]", encodeURIComponent(password));
  }

  if (configured) {
    return configured;
  }

  const projectRef =
    process.env.SUPABASE_PROJECT_REF?.trim() ||
    getProjectRef(process.env.NEXT_PUBLIC_SUPABASE_URL);

  if (!password || !projectRef) {
    return "";
  }

  const encodedPassword = encodeURIComponent(password);

  return `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`;
}

export function buildDirectDatabaseUrl() {
  const configured = process.env.DIRECT_URL?.trim();
  const password = process.env.SUPABASE_DB_PASSWORD?.trim();

  if (configured?.includes("[YOUR-PASSWORD]")) {
    if (!password) {
      return "";
    }

    return configured.replaceAll("[YOUR-PASSWORD]", encodeURIComponent(password));
  }

  if (configured) {
    return configured;
  }

  const projectRef = process.env.SUPABASE_PROJECT_REF?.trim();

  if (!password || !projectRef) {
    return buildDatabaseUrl();
  }

  return `postgresql://postgres:${encodeURIComponent(password)}@db.${projectRef}.supabase.co:5432/postgres?sslmode=require`;
}

export function toPrismaPgConnection(databaseUrl: string) {
  const queryIndex = databaseUrl.indexOf("?");
  const base = queryIndex === -1 ? databaseUrl : databaseUrl.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : databaseUrl.slice(queryIndex + 1);
  const params = new URLSearchParams(query);
  const sslMode = params.get("sslmode");
  params.delete("sslmode");
  const nextQuery = params.toString();
  const connectionString = nextQuery ? `${base}?${nextQuery}` : base;

  if (!sslMode || sslMode === "disable") {
    return { connectionString };
  }

  return {
    connectionString,
    ssl: { rejectUnauthorized: false },
  };
}
