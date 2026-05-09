import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["cs", "en"],
  defaultLocale: "cs",
});

export const config = {
  // Match all paths except Next.js internals, static files, and files with extensions
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
