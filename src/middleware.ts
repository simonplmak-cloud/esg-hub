import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const isVideoDomain = hostname === 'esg.video' || hostname === 'www.esg.video';
  
  if (isVideoDomain) {
    const url = new URL('/videos', request.url);
    return NextResponse.redirect(url, 308);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
