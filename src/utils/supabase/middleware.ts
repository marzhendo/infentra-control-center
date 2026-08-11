import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in, perform RBAC checks
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single() as any
    const pathname = request.nextUrl.pathname

    // Division Admin Logic
    if (profile?.role === 'division_admin' && profile.division_slug) {
      const allowedPath = `/division/${profile.division_slug}`
      
      // Restrict access to their own division page only
      if (
        pathname.startsWith('/login') || 
        pathname === '/' || 
        pathname === '/timeline' || 
        (pathname.startsWith('/division/') && pathname !== allowedPath)
      ) {
        const url = request.nextUrl.clone()
        url.pathname = allowedPath
        return NextResponse.redirect(url)
      }
    } 
    // Master Admin Logic (or fallback if profile is missing division_slug)
    else if (pathname.startsWith('/login')) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
