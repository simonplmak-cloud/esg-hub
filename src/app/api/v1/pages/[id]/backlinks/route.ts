import { NextRequest, NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
const logger = createLogger("api/v1/[id]");
import { getPageByPermalink, isDbConfigured, DB_ERROR } from "@/lib/pages";
import { queryHttp } from "@/lib/surrealdb";
import { formatPermalink } from "@/lib/utils";

export const runtime = "nodejs";

interface BacklinkPage {
  id: string;
  title: string;
  permalink: string;
  section: string | null;
}

function validatePageId(id: string): { valid: boolean; error?: string } {
  if (!id || typeof id !== "string") {
    return { valid: false, error: "Page identifier is required" };
  }
  if (id.length > 500) {
    return { valid: false, error: "Page identifier too long" };
  }
  if (!/^[\w\-\/]+$/.test(id)) {
    return { valid: false, error: "Invalid page identifier format" };
  }
  return { valid: true };
}

async function resolvePageId(idOrPermalink: string): Promise<string | null> {
  if (idOrPermalink.startsWith("page:")) {
    return idOrPermalink;
  }
  const page = await getPageByPermalink(formatPermalink(idOrPermalink));
  if (!page || page === DB_ERROR) return null;
  return page.id;
}


const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  try {
    const { id } = await params;
    
    const idValidation = validatePageId(id);
    if (!idValidation.valid) {
      return NextResponse.json({ error: idValidation.error }, { status: 400 });
    }

    const pageId = await resolvePageId(id);
    if (!pageId) {
      return NextResponse.json({ data: [] }, { status: 404 });
    }

    const backlinks = await queryHttp<BacklinkPage>(
      `SELECT id, title, permalink, section FROM page WHERE $id IN backlinks;`,
      { id: pageId }
    );

    return NextResponse.json({ data: backlinks });
  } catch (error) {
    logger.error("[api] Backlinks error:", error);
    return NextResponse.json(
      { error: "Failed to load backlinks" },
      { status: 500 }
    );
  }
}
