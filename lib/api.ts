// Mock API functions for lead operations

// Mock lead data
const mockLeads = [
    {
      id: "1",
      type: "E-commerce",
      interest: "Kosmetyki",
      score: 85,
      location: "Warszawa",
      date: "2024-01-20",
      email: "test1@example.com",
      phone: "123-456-789",
      price: 10,
    },
    {
      id: "2",
      type: "Usługi",
      interest: "Remonty",
      score: 70,
      location: "Kraków",
      date: "2024-01-15",
      email: "test2@example.com",
      phone: "987-654-321",
      price: 15,
    },
    {
      id: "3",
      type: "Szkolenia",
      interest: "Programowanie",
      score: 92,
      location: "Gdańsk",
      date: "2024-01-10",
      email: "test3@example.com",
      phone: "111-222-333",
      price: 20,
    },
  ]
  
  // Fetch all leads
  export async function fetchLeads() {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return mockLeads
  }
  
  // Purchase a lead
  export async function purchaseLead(leadId: string) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
  
    // In a real app, you would make an API call to purchase the lead
    // and update the user's coin balance
    return {
      success: true,
      message: "Lead purchased successfully",
    }
  }
  
  // Add a new lead
  export async function addLead(leadData: any) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  
    const newLead = {
      ...leadData,
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
    }
  
    return {
      success: true,
      lead: newLead,
    }
  }
  
  // Delete a lead
  export async function deleteLead(leadId: string) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  
    return {
      success: true,
      message: "Lead deleted successfully",
    }
  }
  
  