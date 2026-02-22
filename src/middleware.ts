import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  if (hostname === 'esg.video' || hostname === 'www.esg.video') {
    const url = request.nextUrl.clone();
    url.pathname = '/videos';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
