import { json } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import type { RequestHandler } from './$types';
import { getAdminAuth, getAdminDb, getStudyFlowAppId, requireOwner } from '$lib/server/firebaseAdmin';

function cleanString(value: unknown) {
	return typeof value === 'string' ? value.trim() : '';
}

export const PATCH: RequestHandler = async ({ request, params }) => {
	const decodedToken = await requireOwner(request);
	const targetUid = params.uid;
	const body = await request.json().catch(() => ({}));
	const action = cleanString(body.action);

	if (decodedToken.uid === targetUid && action !== 'password') {
		return json({ message: 'You cannot change owner account access from this panel.' }, { status: 400 });
	}

	try {
		if (action === 'password') {
			const password = cleanString(body.password);

			if (decodedToken.uid === targetUid) {
				return json({ message: 'Use Firebase account settings to change the owner password.' }, { status: 400 });
			}

			if (password.length < 6) {
				return json({ message: 'Password must be at least 6 characters.' }, { status: 400 });
			}

			await getAdminAuth().updateUser(targetUid, { password });
			return json({ ok: true });
		}

		if (action === 'disable') {
			await getAdminAuth().updateUser(targetUid, { disabled: true });
			await getAdminDb()
				.doc(`artifacts/${getStudyFlowAppId()}/userProfiles/${targetUid}`)
				.set({ disabled: true, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
			return json({ ok: true });
		}

		if (action === 'enable') {
			await getAdminAuth().updateUser(targetUid, { disabled: false });
			await getAdminDb()
				.doc(`artifacts/${getStudyFlowAppId()}/userProfiles/${targetUid}`)
				.set({ disabled: false, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
			return json({ ok: true });
		}

		return json({ message: 'Unsupported action.' }, { status: 400 });
	} catch (error) {
		console.error(error);
		return json({ message: 'Could not update user access.' }, { status: 500 });
	}
};
