import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { User, UserWithPassword } from "@/types/user"

// In a real app, this would be in an environment variable
const JWT_SECRET = "your-secret-key-change-this-in-production"

// Mock database - in a real app, this would be a database
const users: UserWithPassword[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    password: bcrypt.hashSync("password123", 10),
    role: "admin",
    coins: 5000,
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@example.com",
    password: bcrypt.hashSync("password123", 10),
    role: "user",
    coins: 1000,
  },
]

export async function findUserByEmail(email: string): Promise<UserWithPassword | null> {
  return users.find((user) => user.email === email) || null
}

export async function createUser(userData: Omit<UserWithPassword, "id" | "role" | "coins">): Promise<User> {
  const id = (users.length + 1).toString()
  const hashedPassword = await bcrypt.hash(userData.password, 10)

  const newUser: UserWithPassword = {
    id,
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    role: "user",
    coins: 500, // Starting coins for new users
  }

  users.push(newUser)

  // Return user without password
  const { password, ...userWithoutPassword } = newUser
  return userWithoutPassword
}

export async function validatePassword(user: UserWithPassword, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password)
}

export function generateToken(user: User): string {
  // Remove sensitive data
  const { password, ...userWithoutPassword } = user as any

  // Generate token that expires in 7 days
  return jwt.sign(userWithoutPassword, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): User | null {
  try {
    return jwt.verify(token, JWT_SECRET) as User
  } catch (error) {
    return null
  }
}

// For admin use only - get all users
export async function getAllUsers(): Promise<User[]> {
  return users.map(({ password, ...user }) => user)
}

// Update user coins
export async function updateUserCoins(userId: string, newCoins: number): Promise<User | null> {
  const userIndex = users.findIndex((user) => user.id === userId)

  if (userIndex === -1) return null

  users[userIndex].coins = newCoins

  const { password, ...userWithoutPassword } = users[userIndex]
  return userWithoutPassword
}

