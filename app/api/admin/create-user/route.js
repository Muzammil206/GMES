import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Create Supabase admin client
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, role, country, title, contactPhone, organization, designation } = body

    // Generate a random password
    const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12)

    // Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("[v0] Auth user creation error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // Create user record in public.users
    const { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .insert({
        firstname: firstName,
        lastname: lastName,
        email,
        role,
        country,
        title: title || null,
        contact_phone: contactPhone || null,
        organization: organization || null,
        designation: designation || null,
        user_id: authData.user.id,
        status: "approved", // Manually created users are auto-approved
      })
      .select()
      .single()

    if (userError) {
      console.error("[v0] User record creation error:", userError)
      // Rollback: delete auth user if user record creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    // TODO: Send email with credentials
    // For now, return the password so admin can share it
    return NextResponse.json({
      success: true,
      user: userData,
      credentials: {
        email,
        password,
      },
    })
  } catch (error) {
    console.error("[v0] Create user error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
