import { FieldValue } from 'firebase-admin/firestore';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getAdminDb, getStudyFlowAppId } from '$lib/server/firebaseAdmin';
import type { OwnerAuditAction } from '$lib/types/ownerAuditLog';

type AuditInput = {
	action: OwnerAuditAction;
	actor: DecodedIdToken;
	targetUid: string;
	targetEmail: string;
	targetName: string;
	message: string;
};

export async function writeOwnerAuditLog(input: AuditInput) {
	await getAdminDb()
		.collection(`artifacts/${getStudyFlowAppId()}/ownerAuditLogs`)
		.add({
			action: input.action,
			actorUid: input.actor.uid,
			actorEmail: input.actor.email ?? '',
			targetUid: input.targetUid,
			targetEmail: input.targetEmail,
			targetName: input.targetName,
			message: input.message,
			createdAt: FieldValue.serverTimestamp()
		});
}
