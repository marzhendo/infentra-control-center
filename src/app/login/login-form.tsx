'use client'

import * as React from 'react'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export function LoginForm({ message }: { message?: string }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // We use formAction to wrap the server action and track submitting state
  const formAction = async (formData: FormData) => {
    setIsSubmitting(true)
    try {
      await login(formData)
    } catch (error) {
      // In case of an unexpected error, we reset it so the user can try again.
      // Next.js redirect() throws an error (NEXT_REDIRECT), but it doesn't trigger catch in action
      // Wait, Next.js redirect actually DOES throw an error that is caught here unless we let it bubble.
      // But if login calls redirect internally, it stops execution and redirects. If it fails, it redirects back to /login?message=...
      // Both cases will navigate away or reload the page.
      setIsSubmitting(false)
    }
  }

  // To prevent the page from being frozen if `login` fails and redirects back with `?message=...`,
  // we can use useEffect to reset `isSubmitting` when `message` changes.
  React.useEffect(() => {
    if (message) {
      setIsSubmitting(false)
    }
  }, [message])

  return (
    <Card className="w-full max-w-sm relative overflow-hidden">
      {/* Top Card Loading Bar */}
      {isSubmitting && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse z-10" />
      )}
      
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Masukkan email dan password untuk mengakses infentra-workspace.
        </CardDescription>
      </CardHeader>
      
      <form action={formAction}>
        <CardContent className="grid gap-5">
          <div className="grid gap-2 space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="acara@infentra.com" required disabled={isSubmitting} />
          </div>
          <div className="grid gap-2 space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required disabled={isSubmitting} />
          </div>
          {message && !isSubmitting && (
            <p className="text-sm text-red-500 font-medium text-center">
              {message}
            </p>
          )}
        </CardContent>
        <CardFooter className="pt-2 mt-2">
          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Verifying Credentials...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
