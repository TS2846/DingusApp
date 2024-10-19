import {NextResponse, NextRequest} from 'next/server';
import {cookies} from 'next/headers';

export function middleware(request: NextRequest) {
    const cookiesStore = cookies();
    // If the user is authenticated, continue as normal
    if (cookiesStore.get('id')) {
        return NextResponse.next();
    }

    // Redirect to login page if not authenticated
    return NextResponse.redirect(new URL('/login', request.url));
}

export const config = {
    matcher: '/',
};
