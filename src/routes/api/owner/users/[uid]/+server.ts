import { json } from '@sveltejs/kit';
import { FieldValue } from 'firebase-admin/firestore';
import type { RequestHandler } from './$types';
import { getAdminAuth, getAdminDb, getStudyFlowAppId, requireOwner } from '$lib/server/firebaseAdmin';
import { writeOwnerAuditLog } from '$lib/server/ownerAuditLogger';

function cleanString(value: unknown) {
	return typeof value === 'string' ? value.trim() : '';
}

async function getProfileSnapshot(userId: string) {
	return getAdminDb().doc(`artifacts/${getStudyFlowAppId()}/userProfiles/${userId}`).get();
}

async function getProfileInfo(userId: string) {
	const userRecord = await getAdminAuth().getUser(userId).catch(() => null);
	const profileSnapshot = await getProfileSnapshot(userId);
	const profile = profileSnapshot.data();

	return {
		name: userRecord?.displayName || (typeof profile?.name === 'string' ? profile.name : '') || 'Unknown user',
		email: userRecord?.email || (typeof profile?.email === 'string' ? profile.email : '') || ''
	};
}

async function removeAccountData(userId: string) {
	const db = getAdminDb();
	const appId = getStudyFlowAppId();

	await db.recursiveDelete(db.doc(`artifacts/${appId}/users/${userId}`));
	await db.doc(`artifacts/${appId}/userProfiles/${userId}`).delete();
}

export const PATCH: RequestHandler = async ({ request, params }) => {
	const owner = await requireOwner(request);
	const targetUid = params.uid;
	const body = await request.json().catch(() => ({}));
	const action = cleanString(body.action);

	if (owner.uid === targetUid && action !== 'password') {
		return json({ message: 'You cannot change owner account access from this panel.' }, { status: 400 });
	}

	try {
		const target = await getProfileInfo(targetUid);

		if (action === 'password') {
			const password = cleanString(body.password);

			if (owner.uid === targetUid) {
				return json({ message: 'Use Firebase account settings to change the owner password.' }, { status: 400 });
			}

			if (password.length < 6) {
				return json({ message: 'Password must be at least 6 characters.' }, { status: 400 });
			}

			await getAdminAuth().updateUser(targetUid, { password });
			await writeOwnerAuditLog({
				action: 'account_password_updated',
				actor: owner,
				targetUid,
				targetEmail: target.email,
				targetName: target.name,
				message: `Updated sign-in credential for ${target.name}.`
			});
			return json({ ok: true });
		}

		if (action === 'disable') {
			await getAdminAuth().updateUser(targetUid, { disabled: true });
			await getAdminDb()
				.doc(`artifacts/${getStudyFlowAppId()}/userProfiles/${targetUid}`)
				.set({ disabled: true, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
			await writeOwnerAuditLog({
				action: 'account_suspended',
				actor: owner,
				targetUid,
				targetEmail: target.email,
				targetName: target.name,
				message: `Suspended sign-in access for ${target.name}.`
			});
			return json({ ok: true });
		}

		if (action === 'enable') {
			await getAdminAuth().updateUser(targetUid, { disabled: false });
			await getAdminDb()
				.doc(`artifacts/${getStudyFlowAppId()}/userProfiles/${targetUid}`)
				.set({ disabled: false, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
			await writeOwnerAuditLog({
				action: 'account_restored',
				actor: owner,
				targetUid,
				targetEmail: target.email,
				targetName: target.name,
				message: `Restored sign-in access for ${target.name}.`
			});
			return json({ ok: true });
		}

		if (action === 'remove') {
			await writeOwnerAuditLog({
				action: 'account_removed',
				actor: owner,
				targetUid,
				targetEmail: target.email,
				targetName: target.name,
				message: `Removed account for ${target.name}.`
			});
			await removeAccountData(targetUid);
			await getAdminAuth().deleteUser(targetUid).catch((error) => {
				const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
				if (code !== 'auth/user-not-found') throw error;
			});
			return json({ ok: true });
		}

		return json({ message: 'Unsupported action.' }, { status: 400 });
	} catch (error) {
		console.error(error);
		return json({ message: 'Could not update user access.' }, { status: 500 });
	}
};
