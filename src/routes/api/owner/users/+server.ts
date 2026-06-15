import { json } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import type { RequestHandler } from './$types';
import { getAdminAuth, getAdminDb, getStudyFlowAppId, requireOwner } from '$lib/server/firebaseAdmin';
import { writeOwnerAuditLog } from '$lib/server/ownerAuditLogger';

function cleanString(value: unknown) {
	return typeof value === 'string' ? value.trim() : '';
}

export const POST: RequestHandler = async ({ request }) => {
	const owner = await requireOwner(request);

	const body = await request.json().catch(() => ({}));
	const name = cleanString(body.name);
	const email = cleanString(body.email).toLowerCase();
	const password = cleanString(body.password);

	if (!name) {
		return json({ message: 'Name is required.' }, { status: 400 });
	}

	if (!email) {
		return json({ message: 'Email is required.' }, { status: 400 });
	}

	if (password.length < 6) {
		return json({ message: 'Password must be at least 6 characters.' }, { status: 400 });
	}

	try {
		const userRecord = await getAdminAuth().createUser({
			displayName: name,
			email,
			password,
			emailVerified: false,
			disabled: false
		});

		await getAdminDb()
			.doc(`artifacts/${getStudyFlowAppId()}/userProfiles/${userRecord.uid}`)
			.set(
				{
					uid: userRecord.uid,
					name,
					email,
					role: 'user',
					disabled: false,
					createdAt: FieldValue.serverTimestamp(),
					lastLoginAt: FieldValue.serverTimestamp(),
					updatedAt: FieldValue.serverTimestamp(),
					assignmentCount: 0,
					completedCount: 0,
					activeCount: 0,
					overdueCount: 0
				},
				{ merge: true }
			);

		await writeOwnerAuditLog({
			action: 'account_created',
			actor: owner,
			targetUid: userRecord.uid,
			targetEmail: email,
			targetName: name,
			message: `Created account for ${name}.`
		});

		return json({
			uid: userRecord.uid,
			name,
			email
		});
	} catch (error) {
		const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';

		if (code === 'auth/email-already-exists') {
			return json({ message: 'A user with this email already exists.' }, { status: 409 });
		}

		console.error(error);
		return json({ message: 'Could not create user.' }, { status: 500 });
	}
};
