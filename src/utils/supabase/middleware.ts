import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
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

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // getUser(). A simple mistake can make it very hard to debug
  // issues with sessions being lost.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    request.nextUrl.pathname !== '/'
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user) {
    const role = user.user_metadata?.role as string | undefined
    const path = request.nextUrl.pathname

    // Role-based route protection
    const roleRoutes: Record<string, string> = {
      admin: '/admin',
      teacher: '/teacher',
      student: '/student',
      parent: '/parent',
    }

    // Check if user is trying to access another role's dashboard
    for (const [r, route] of Object.entries(roleRoutes)) {
      if (path.startsWith(route) && role !== r) {
        // Redirect to their own dashboard if they try to access another one
        const targetRoute = roleRoutes[role || 'admin'] || '/login'
        const url = request.nextUrl.clone()
        url.pathname = targetRoute
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
