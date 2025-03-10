export interface User {
    id: string
    name: string
    email: string
    role: "user" | "admin"
    coins: number
  }
  
  export interface UserWithPassword extends User {
    password: string
  }
  