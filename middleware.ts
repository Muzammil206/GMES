import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"
import { routing } from "./i18n/routing"

const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  const response = intlMiddleware(request)

  // If intlMiddleware already returned a redirect response, return it
  if (response.status !== 200 && response.headers.get("x-middleware-rewrite")) {
    return response
  }

  const pathname = request.nextUrl.pathname
  const localeMatch = pathname.match(/^\/([a-z]{2})(?:\/|$)/)
  const locale = localeMatch ? localeMatch[1] : routing.defaultLocale

  let supabaseResponse = response

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
              request,
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
    console.error(" Middleware error:", error)
    return supabaseResponse
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|appi.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
