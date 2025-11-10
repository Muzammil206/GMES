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

  // If the request is for a static asset (has a file extension), don't try to resolve locale from it
  if (/\.[a-z0-9]+(\?|$)/i.test(pathname)) {
    return {
      locale: routing.defaultLocale,
      messages: {},
    }
  }

  // Start with any locale provided by Next if it's valid, otherwise use the default
  let locale = routing.defaultLocale
  if (params?.locale && routing.locales.includes(params.locale)) {
    locale = params.locale
  }

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
