import Surreal from "surrealdb";

// Credentials are sourced exclusively from environment variables.
// Set SURREAL_ENDPOINT, SURREAL_USERNAME, SURREAL_PASSWORD,
// SURREAL_NAMESPACE, and SURREAL_DATABASE in your deployment environment.
// NOTE: Access env vars inside functions, not at module level, for Vercel compatibility

let dbInstance: Surreal | null = null;

function getEnvVars() {
  return {
    endpoint: process.env.SURREAL_ENDPOINT || "",
    username: process.env.SURREAL_USERNAME || "",
    password: process.env.SURREAL_PASSWORD || "",
    namespace: process.env.SURREAL_NAMESPACE || "",
    database: process.env.SURREAL_DATABASE || "",
  };
}

export async function getDb(): Promise<Surreal> {
  if (dbInstance) {
    return dbInstance;
  }

  const env = getEnvVars();
  const db = new Surreal();

  await db.connect(env.endpoint, {
    namespace: env.namespace,
    database: env.database,
    auth: {
      username: env.username,
      password: env.password,
    },
  });

  dbInstance = db;
  return db;
}

/**
 * Sanitize a string value for safe use in SurrealQL queries.
 * Escapes single quotes and backslashes to prevent injection.
 */
export function sanitize(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/[\x00-\x1f]/g, ""); // Strip control characters
}

/**
 * Validate and sanitize a numeric parameter
 */
export function sanitizeInt(value: string | null, defaultVal: number, min: number, max: number): number {
  if (!value) return defaultVal;
  const num = parseInt(value, 10);
  if (isNaN(num)) return defaultVal;
  return Math.max(min, Math.min(max, num));
}

/**
 * Validate that a string matches a safe alphanumeric pattern (for section/pillar names)
 */
export function isAlphanumericDash(value: string): boolean {
  return /^[a-zA-Z0-9\-_ &]+$/.test(value);
}

/**
 * Execute a raw SurrealQL query via HTTP (more reliable for server-side use in Next.js).
 * Supports optional variables for parameterized queries.
 */
export async function queryHttp<T = unknown>(
  query: string,
  vars?: Record<string, unknown>
): Promise<T[]> {
  const env = getEnvVars();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "surreal-ns": env.namespace,
    "surreal-db": env.database,
    Authorization:
      "Basic " +
      Buffer.from(`${env.username}:${env.password}`).toString(
        "base64"
      ),
  };

  let reqBody: string;
  let contentType: string;

  if (vars && Object.keys(vars).length > 0) {
    // Use JSON body with variables for parameterized queries
    contentType = "application/json";
    reqBody = JSON.stringify({ query, variables: vars });
  } else {
    contentType = "text/plain";
    reqBody = query;
  }

  headers["Content-Type"] = contentType;

  const res = await fetch(`${env.endpoint}/sql`, {
    method: "POST",
    headers,
    body: reqBody,
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    console.error(`[SurrealDB] HTTP ${res.status}: ${errorText}`);
    throw new Error(`Database query failed (HTTP ${res.status})`);
  }

  const resBody = await res.json();
  const results = resBody as Array<{
    result: T[];
    status: string;
    time: string;
  }>;

  // Defensive: ensure results is a valid array
  if (!Array.isArray(results) || results.length === 0) {
    console.error("[SurrealDB] Unexpected response format:", JSON.stringify(resBody).slice(0, 500));
    throw new Error("Database returned an unexpected response format");
  }

  // Return the result from the last statement
  const last = results[results.length - 1];
  if (last?.status !== "OK") {
    console.error("[SurrealDB] Query error:", JSON.stringify(last));
    throw new Error("Database query returned an error");
  }

  return Array.isArray(last.result) ? last.result : [];
}

/**
 * Execute multiple statements and return all results
 */
export async function queryHttpAll<T = unknown>(
  query: string
): Promise<
  Array<{ result: T[]; status: string; time: string }>
> {
  const env = getEnvVars();
  const res = await fetch(`${env.endpoint}/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Accept: "application/json",
      "surreal-ns": env.namespace,
      "surreal-db": env.database,
      Authorization:
        "Basic " +
        Buffer.from(`${env.username}:${env.password}`).toString(
          "base64"
        ),
    },
    body: query,
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    console.error(`[SurrealDB] HTTP ${res.status}: ${errorText}`);
    throw new Error(`Database query failed (HTTP ${res.status})`);
  }

  return res.json();
}
