// This file is needed for compatibility with existing code
// It re-exports the toast function from sonner

import { toast } from "sonner"

export { toast }

export const useToast = () => {
  return {
    toast,
  }
}

