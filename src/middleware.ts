import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

const intlMiddleware = createMiddleware({
  locales: ["cs", "en"],
  defaultLocale: "cs",
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and any file with an extension
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/:path*"],
};
