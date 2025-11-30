// src/hooks.server.ts
import { error, type Handle } from '@sveltejs/kit';
//import { env } from '$env/dynamic/private';

export const handle: Handle = async ({ event, resolve }) => {
	// Define the path you want to protect with basic auth
	if (event.url.pathname.startsWith('/admin')) {
		const authHeader = event.request.headers.get('authorization');

		if (!authHeader) {
			throw error(401, 'Authorization Required');
		}

		const [scheme, credentials] = authHeader.split(' ');

		if (scheme !== 'Basic' || !credentials) {
			throw error(401, 'Invalid Authorization Scheme');
		}

		const decodedCredentials = Buffer.from(credentials, 'base64').toString();
		const [username, password] = decodedCredentials.split(':');

		// Replace with your actual username and password from environment variables
		const expectedUsername = process.env.BASIC_AUTH_USERNAME;
		const expectedPassword = process.env.BASIC_AUTH_PASSWORD;

		if (username !== expectedUsername || password !== expectedPassword) {
			throw error(401, 'Invalid Credentials');
		}
	}

	return resolve(event);
};