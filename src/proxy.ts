import { authMiddleware, redirectToLogin } from "next-firebase-auth-edge";
import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";

const LOCALES = ["cs", "en"] as const;
const DEFAULT_LOCALE = "cs";

const AUTH_COOKIE_OPTIONS = {
  cookieName: "session",
  cookieSignatureKeys: [
    process.env.AUTH_COOKIE_SIGNATURE_KEY_CURRENT ?? "fallback-dev-key-change-in-prod",
    process.env.AUTH_COOKIE_SIGNATURE_KEY_PREVIOUS ?? "fallback-dev-key-change-in-prod",
  ],
  cookieSerializeOptions: {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 14, // 14 days
  },
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
};

const intl = createIntlMiddleware({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
});

function getLocaleFromPathname(pathname: string): string {
  return LOCALES.find((l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`) ?? DEFAULT_LOCALE;
}

function isProtectedPath(pathname: string): boolean {
  return LOCALES.some(
    (l) =>
      pathname.startsWith(`/${l}/dashboard`) ||
      pathname.startsWith(`/${l}/broadcast`)
  );
}

function isAuthPath(pathname: string): boolean {
  return LOCALES.some((l) => pathname.startsWith(`/${l}/auth`));
}

export async function proxy(request: NextRequest) {
  return authMiddleware(request, {
    ...AUTH_COOKIE_OPTIONS,
    loginPath: "/api/auth/login",
    logoutPath: "/api/auth/logout",

    handleValidToken: async (_tokens, headers) => {
      // Authenticated — redirect away from auth pages, otherwise run intl routing
      if (isAuthPath(request.nextUrl.pathname)) {
        const locale = getLocaleFromPathname(request.nextUrl.pathname);
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
      }
      const response = intl(request);
      headers.forEach((value, key) => response.headers.set(key, value));
      return response;
    },

    handleInvalidToken: async () => {
      // Not authenticated — protect dashboard/broadcast
      if (isProtectedPath(request.nextUrl.pathname)) {
        const locale = getLocaleFromPathname(request.nextUrl.pathname);
        return redirectToLogin(request, {
          path: `/${locale}/auth/login`,
          publicPaths: [],
        });
      }
      return intl(request);
    },

    handleError: async () => {
      return intl(request);
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
