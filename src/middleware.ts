import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const isVideoDomain = hostname === 'esg.video' || hostname === 'www.esg.video' || hostname.endsWith('.esg.video');
  
  if (isVideoDomain && !request.nextUrl.pathname.startsWith('/videos')) {
    return NextResponse.redirect(new URL('/videos', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
