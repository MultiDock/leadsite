import { type NextRequest, NextResponse } from "next/server"
import { findUserByEmail, validatePassword, generateToken } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email i hasło są wymagane" }, { status: 400 })
    }

    // Find user
    const user = await findUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Nieprawidłowy email lub hasło" }, { status: 401 })
    }

    // Validate password
    const isValidPassword = await validatePassword(user, password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Nieprawidłowy email lub hasło" }, { status: 401 })
    }

    // Generate token
    const token = generateToken(user)

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Wystąpił błąd podczas logowania" }, { status: 500 })
  }
}

