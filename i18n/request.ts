import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"
import { headers } from "next/headers"

export default getRequestConfig(async (params: any) => {
  // Try to get pathname from params (preferred), otherwise fall back to header names used by Next
  let pathname: string | undefined = params?.pathname

  if (!pathname) {
    const headersList = await headers()
    pathname =
      headersList.get("x-pathname") ?? headersList.get("x-nextjs-pathname") ?? headersList.get("x-url") ?? "/"
  }

  // Start with any locale provided by Next, otherwise use the default
  let locale = params?.locale ?? routing.defaultLocale

  // Extract locale from pathname pattern like /en, /fr, etc.
  const localeMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/)
  if (localeMatch && routing.locales.includes(localeMatch[1] as any)) {
    locale = localeMatch[1] as typeof routing.locales[number]
  }

  // Safely load messages
  try {
    const messages = (await import(`../messages/${locale}.json`)).default
    return {
      locale,
      messages,
    }
  } catch (err) {
    console.error("i18n: failed to load messages for", locale, err)
    return {
      locale,
      messages: {},
    }
  }
})
