import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const isVideoDomain = hostname === 'esg.video' || hostname === 'www.esg.video' || hostname.endsWith('.esg.video');
  
  // Only redirect if on esg.video domain and not already on /videos
  if (isVideoDomain && !request.nextUrl.pathname.startsWith('/videos')) {
    // Use absolute URL to ensure consistent redirect to esg-hub.ascent.partners
    const url = new URL('https://esg-hub.ascent.partners/videos');
    return NextResponse.redirect(url, 308);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
