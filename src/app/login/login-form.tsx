'use client'

import * as React from 'react'
import { login } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function LoginForm({ message }: { message?: string }) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState(message || '')
  const [isPending, startTransition] = React.useTransition()
  const router = useRouter()

  const formAction = async (formData: FormData) => {
    setIsSubmitting(true)
    setErrorMessage('')
    
    try {
      const result = await login(formData)
      
      if (result?.error) {
        setIsSubmitting(false)
        setErrorMessage(result.error)
      } else {
        setIsSuccess(true)
        // Show loading animation for at least 600ms
        await new Promise((resolve) => setTimeout(resolve, 600));
        
        startTransition(() => {
          router.push('/')
          router.refresh()
        })
      }
    } catch (error) {
      setIsSubmitting(false)
      setErrorMessage('An unexpected error occurred')
    }
  }

  React.useEffect(() => {
    if (message) {
      setErrorMessage(message)
    }
  }, [message])

  const isLoading = isSubmitting || isPending

  return (
    <Card className="w-full max-w-sm relative overflow-hidden">
      {/* Top Card Loading Bar */}
      {isLoading && (
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
            <Input id="email" name="email" type="email" placeholder="acara@infentra.com" required disabled={isLoading} />
          </div>
          <div className="grid gap-2 space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required disabled={isLoading} />
          </div>
          {errorMessage && !isLoading && (
            <p className="text-sm text-red-500 font-medium text-center">
              {errorMessage}
            </p>
          )}
        </CardContent>
        <CardFooter className="pt-2 mt-2">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                {isSuccess ? "Redirecting to Workspace..." : "Verifying Credentials..."}
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
