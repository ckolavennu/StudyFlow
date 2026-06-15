import { env } from '$env/dynamic/private';
import { error } from '@sveltejs/kit';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function getPrivateKey() {
	return env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
}

function getAdminApp() {
	const projectId = env.FIREBASE_ADMIN_PROJECT_ID;
	const clientEmail = env.FIREBASE_ADMIN_CLIENT_EMAIL;
	const privateKey = getPrivateKey();

	if (!projectId || !clientEmail || !privateKey) {
		throw error(500, 'Firebase Admin environment variables are not configured.');
	}

	const existingApp = getApps()[0];

	if (existingApp) {
		return existingApp;
	}

	return initializeApp({
		credential: cert({
			projectId,
			clientEmail,
			privateKey
		})
	});
}

export function getAdminAuth() {
	return getAuth(getAdminApp());
}

export function getAdminDb() {
	return getFirestore(getAdminApp());
}

export function getStudyFlowAppId() {
	return env.STUDYFLOW_APP_ID || 'studyflow';
}

export async function requireOwner(request: Request) {
	const superAdminUid = env.SUPERADMIN_UID;

	if (!superAdminUid) {
		throw error(500, 'SUPERADMIN_UID is not configured.');
	}

	const authorization = request.headers.get('authorization') ?? '';
	const token = authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : '';

	if (!token) {
		throw error(401, 'Missing authentication token.');
	}

	const decodedToken = await getAdminAuth().verifyIdToken(token);

	if (decodedToken.uid !== superAdminUid) {
		throw error(403, 'Owner access required.');
	}

	return decodedToken;
}
