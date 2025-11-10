import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"
import { setRequestLocale } from "next-intl/server"

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const localeMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/)
  const hasLocalePrefix = localeMatch !== null

  if (!hasLocalePrefix && pathname === "/") {
    // Let next-intl middleware handle the root redirect
    const response = intlMiddleware(request)
    if (response.status !== 200) {
      return response
    }
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)

  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale

  // Set the locale in the request context for next-intl v4
  setRequestLocale(locale)

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
            })
            supabaseResponse = NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            })
            cookiesToSet.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, options)
            })
          },
        },
      },
    )

    // Refresh session if expired
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (pathname.startsWith(`/${locale}/dashboard`)) {
      if (!user) {
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
      }

      // Check if user is approved
      const { data: userData } = await supabase.from("users").select("status, role").eq("user_id", user.id).single()

      if (!userData || userData.status !== "approved") {
        return NextResponse.redirect(new URL(`/${locale}/pending-approval`, request.url))
      }
    }

    // Redirect to dashboard if already logged in and trying to access login/signup
    if ((pathname.startsWith(`/${locale}/login`) || pathname.startsWith(`/${locale}/signup`)) && user) {
      const { data: userData } = await supabase.from("users").select("status").eq("user_id", user.id).single()

      if (userData?.status === "approved") {
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url))
      } else {
        return NextResponse.redirect(new URL(`/${locale}/pending-approval`, request.url))
      }
    }

    return supabaseResponse
  } catch (error) {
    console.error("[v0] Middleware error:", error)
    return supabaseResponse
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
