"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Moon, Sun, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import * as React from "react"
import { Database } from "@/types/database"

export function AppHeader() {
  const { setTheme, theme } = useTheme()
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  
  const [email, setEmail] = React.useState<string | null>(null)
  const [role, setRole] = React.useState<string | null>(null)
  const [initials, setInitials] = React.useState<string>("U")

  React.useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setEmail(user.email || null)
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        const profile = profileData as Database['public']['Tables']['profiles']['Row'] | null
        if (profile) {
          const roleText = profile.role === 'master_admin' ? 'Master Admin' : 'Division Admin'
          setRole(roleText)
          
          if (profile.role === 'master_admin') {
            setInitials('MA')
          } else if (profile.division_slug) {
            setInitials(profile.division_slug.substring(0, 2).toUpperCase())
          } else if (user.email) {
            setInitials(user.email.substring(0, 2).toUpperCase())
          }
        }
      }
    }
    loadUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 px-4 justify-between backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <h1 className="font-semibold tracking-tight text-lg">INFENTRA 2.0</h1>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-8 w-8 rounded-full border border-slate-200 dark:border-slate-800" />}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <div className="flex flex-col space-y-1 p-2">
              <p className="text-sm font-medium leading-none">{role || 'User'}</p>
              <p className="text-xs leading-none text-muted-foreground">{email}</p>
            </div>
            <Separator className="my-1" />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-500">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
