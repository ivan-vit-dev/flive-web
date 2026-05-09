import { getRequestConfig } from "next-intl/server";

const locales = ["cs", "en"];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const resolvedLocale = locale && locales.includes(locale) ? locale : "cs";

  return {
    locale: resolvedLocale,
    messages: (await import(`../../messages/${resolvedLocale}.json`)).default,
  };
});
