import Surreal from "surrealdb";

const SURREAL_ENDPOINT =
  process.env.SURREAL_ENDPOINT ||
  "https://valuation-webap-06dvm6i94trq92goln8f5gebnk.aws-euw1.surreal.cloud";
const SURREAL_USERNAME = process.env.SURREAL_USERNAME || "root";
const SURREAL_PASSWORD = process.env.SURREAL_PASSWORD || "";
const SURREAL_NAMESPACE = process.env.SURREAL_NAMESPACE || "esg_hub";
const SURREAL_DATABASE = process.env.SURREAL_DATABASE || "main";

let dbInstance: Surreal | null = null;

export async function getDb(): Promise<Surreal> {
  if (dbInstance) {
    return dbInstance;
  }

  const db = new Surreal();

  await db.connect(SURREAL_ENDPOINT, {
    namespace: SURREAL_NAMESPACE,
    database: SURREAL_DATABASE,
    auth: {
      username: SURREAL_USERNAME,
      password: SURREAL_PASSWORD,
    },
  });

  dbInstance = db;
  return db;
}

/**
 * Execute a raw SurrealQL query via HTTP (more reliable for server-side use in Next.js)
 */
export async function queryHttp<T = unknown>(
  query: string,
  vars?: Record<string, unknown>
): Promise<T[]> {
  const res = await fetch(`${SURREAL_ENDPOINT}/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Accept: "application/json",
      "surreal-ns": SURREAL_NAMESPACE,
      "surreal-db": SURREAL_DATABASE,
      Authorization:
        "Basic " +
        Buffer.from(`${SURREAL_USERNAME}:${SURREAL_PASSWORD}`).toString(
          "base64"
        ),
    },
    body: query,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`SurrealDB HTTP error: ${res.status} ${res.statusText}`);
  }

  const results = (await res.json()) as Array<{
    result: T[];
    status: string;
    time: string;
  }>;

  // Return the result from the last statement
  const last = results[results.length - 1];
  if (last?.status !== "OK") {
    throw new Error(
      `SurrealDB query error: ${JSON.stringify(last)}`
    );
  }

  return last.result;
}

/**
 * Execute multiple statements and return all results
 */
export async function queryHttpAll<T = unknown>(
  query: string
): Promise<
  Array<{ result: T[]; status: string; time: string }>
> {
  const res = await fetch(`${SURREAL_ENDPOINT}/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      Accept: "application/json",
      "surreal-ns": SURREAL_NAMESPACE,
      "surreal-db": SURREAL_DATABASE,
      Authorization:
        "Basic " +
        Buffer.from(`${SURREAL_USERNAME}:${SURREAL_PASSWORD}`).toString(
          "base64"
        ),
    },
    body: query,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`SurrealDB HTTP error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
