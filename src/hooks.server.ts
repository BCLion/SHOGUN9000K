// src/hooks.server.ts — FREE PASSWORD PROTECTION (stealth mode engaged)
import type { Handle } from '@sveltejs/kit';

const PASSWORD = 'arrakis9000'; // change whenever you want

export const handle: Handle = async ({ event, resolve }) => {
  const auth = event.request.headers.get('authorization');

  if (event.url.pathname.startsWith('/admin') || event.url.pathname === '/favicon.ico') {
    return await resolve(event);
  }

  if (auth === `Basic ${btoa(`spice:${PASSWORD}`)}`) {
    return await resolve(event);
  }

  return new Response('Access denied. The spice must be earned.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="SHOGUN9000K — Classified Access"'
    }
  });
};