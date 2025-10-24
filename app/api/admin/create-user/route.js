import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    console.log("[v0] Create user API called")

    // Get admin client
    let supabaseAdmin
    try {
      supabaseAdmin = getSupabaseAdmin()
    } catch (error) {
      console.error("[v0] Failed to initialize Supabase admin:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const body = await request.json()
    console.log("[v0] Request body:", { ...body, password: "[REDACTED]" })

    const { firstName, lastName, email, role, country, title, contactPhone, organization, designation } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !role || !country) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate a random password
    const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase() + "!1"
    console.log("[v0] Generated password for user")

    // Create auth user
    console.log("[v0] Creating auth user...")
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("[v0] Auth user creation error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    console.log("[v0] Auth user created:", authData.user.id)

    // Create user record in public.users
    console.log("[v0] Creating user record in public.users...")
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
      console.log("[v0] Rolling back auth user creation...")
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: userError.message }, { status: 400 })
    }

    console.log("[v0] User created successfully:", userData.id)

    // Return success with credentials
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
    return NextResponse.json(
      {
        error: "Failed to create user",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
