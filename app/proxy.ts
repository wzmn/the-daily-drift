import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. ALLOW the proxy-image API to bypass authentication
    if (pathname.startsWith("/api/proxy-image")) {
        return NextResponse.next();
    }

    const sessionCookie = getSessionCookie(request);
    
    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    
    return NextResponse.next();
}

export const config = {
    // 2. Ensure your matcher covers your dashboard but stays away from static assets
    matcher: ["/dashboard/:path*", "/profile/:path*", "/register", "/api/publish"], 
};