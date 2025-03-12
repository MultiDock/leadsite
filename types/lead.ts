export interface Lead {
    id: string
    type: string
    interest: string
    location: string
    email: string
    phone: string
    score: number
    price: number
    date: string
    status: "available" | "sold"
    created_at?: string
    added_by?: string
    order_number?: string
    purchasedBy?: string
  }
  
  