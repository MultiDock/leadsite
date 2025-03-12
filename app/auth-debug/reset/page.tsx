"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function AuthDebugResetPage() {
  const [newPassword, setNewPassword] = useState("")
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Add a log entry with timestamp
  const addLog = (message: string) => {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0]
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev])
  }

  // Check session on load
  useEffect(() => {
    const checkSession = async () => {
      addLog("Checking current session...")
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          addLog(`Session error: ${error.message}`)
          return
        }

        if (data.session) {
          addLog(`Active session found for: ${data.session.user.email}`)
          addLog(`User ID: ${data.session.user.id}`)
          addLog(`Session expires: ${new Date(data.session.expires_at! * 1000).toLocaleString()}`)
        } else {
          addLog("No active session found - password reset may not work")
          addLog("Make sure you clicked the reset link from your email")
        }
      } catch (err: any) {
        addLog(`Exception checking session: ${err.message}`)
      }
    }

    checkSession()
  }, [])

  // Update password function
  const handleUpdatePassword = async () => {
    if (!newPassword) {
      addLog("Please enter a new password")
      return
    }

    if (newPassword.length < 6) {
      addLog("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    addLog("Attempting to update password...")

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        addLog(`Update password error: ${error.message}`)
      } else {
        addLog("Password updated successfully!")
        if (data.user) {
          addLog(`Updated user: ${data.user.email}`)
        }
      }
    } catch (err: any) {
      addLog(`Exception during password update: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Password Reset Debugging</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium">
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <Button onClick={handleUpdatePassword} disabled={loading} className="w-full">
                Update Password
              </Button>

              <div className="text-xs text-muted-foreground mt-4">
                <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✓ Set" : "✗ Not set"}</p>
                <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✓ Set" : "✗ Not set"}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Auth Logs:</h3>
              <div className="bg-muted p-3 rounded-md h-[300px] overflow-y-auto text-xs font-mono">
                {logs.length > 0 ? (
                  logs.map((log, i) => (
                    <div key={i} className="pb-1">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground">No logs yet...</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

