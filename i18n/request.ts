import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale: incomingLocale }) => {
  // Use the locale from Next.js or fall back to default
  const locale = (incomingLocale ?? routing.defaultLocale) as (typeof routing.locales)[number];

  // Make sure the locale is valid
  const resolvedLocale = routing.locales.includes(locale)
    ? locale
    : routing.defaultLocale;

  try {
    // Load the locale messages
    const messages = (await import(`../messages/${resolvedLocale}.json`)).default;

    return {
      locale: resolvedLocale,
      messages,
    };
  } catch (err) {
    console.error("❌ Failed to load messages for locale:", resolvedLocale, err);
    return {
      locale: resolvedLocale,
      messages: {},
    };
  }
});
