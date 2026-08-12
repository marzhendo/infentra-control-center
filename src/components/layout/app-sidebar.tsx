import { Calendar, LayoutDashboard, Briefcase } from "lucide-react"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { createClient } from "@/utils/supabase/server"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    masterOnly: true,
  },
  {
    title: "Master Timeline",
    url: "/timeline",
    icon: Calendar,
  },
]

export async function AppSidebar() {
  const supabase = (await createClient()) as any
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('role, division_slug').eq('id', user.id).single()
    profile = data
  }

  const { data: divisions } = await supabase.from('divisions').select('name, slug').order('name')
  let divList = divisions || []

  // RBAC Filtering
  const isDivisionAdmin = profile?.role === 'division_admin'
  if (isDivisionAdmin && profile?.division_slug) {
    divList = divList.filter((div: any) => div.slug === profile.division_slug)
  }

  const visibleItems = items.filter(item => {
    if (isDivisionAdmin && item.masterOnly) return false
    return true
  })

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<Link href={item.url} prefetch={true} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{isDivisionAdmin ? 'My Division' : 'Divisions'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {divList.map((div: any) => (
                <SidebarMenuItem key={div.slug}>
                  <SidebarMenuButton render={<Link href={`/division/${div.slug}`} />}>
                    <Briefcase />
                    <span>{div.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
