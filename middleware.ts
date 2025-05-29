import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

function isProtected(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  if (pathname.startsWith("/admin")) return true;
  if (pathname === "/api/uploads" && method === "POST") return true;
  if (pathname === "/api/announcements" && method === "POST") return true;
  if (
    pathname.startsWith("/api/announcements/") &&
    (method === "PUT" || method === "DELETE")
  )
    return true;

  return false;
}

function unauthorized() {
  return new NextResponse(null, {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Admin Paneli"',
    },
  });
}

export function middleware(request: NextRequest) {
  if (!isProtected(request)) return NextResponse.next();

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) return unauthorized();

  const [username, password] = Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":");

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD)
    return unauthorized();

  return NextResponse.next();
}

