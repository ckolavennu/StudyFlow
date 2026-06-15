import {
	collection,
	limit,
	onSnapshot,
	orderBy,
	query,
	type FirestoreError,
	type Timestamp,
	type Unsubscribe
} from 'firebase/firestore';
import { appId, db } from '$lib/firebase';
import type { OwnerAuditAction, OwnerAuditLog } from '$lib/types/ownerAuditLog';

function getAuditCollection() {
	return collection(db, 'artifacts', appId, 'ownerAuditLogs');
}

export function listenToOwnerAuditLogs(
	onLogs: (logs: OwnerAuditLog[]) => void,
	onError?: (error: FirestoreError) => void
): Unsubscribe {
	const logsQuery = query(getAuditCollection(), orderBy('createdAt', 'desc'), limit(25));

	return onSnapshot(
		logsQuery,
		(snapshot) => {
			const logs = snapshot.docs.map((document) => {
				const data = document.data();
				const createdAt = data.createdAt as Timestamp | undefined;

				return {
					id: document.id,
					action: data.action as OwnerAuditAction,
					actorUid: typeof data.actorUid === 'string' ? data.actorUid : '',
					actorEmail: typeof data.actorEmail === 'string' ? data.actorEmail : '',
					targetUid: typeof data.targetUid === 'string' ? data.targetUid : '',
					targetEmail: typeof data.targetEmail === 'string' ? data.targetEmail : '',
					targetName: typeof data.targetName === 'string' ? data.targetName : 'Unknown user',
					message: typeof data.message === 'string' ? data.message : 'Owner action recorded.',
					createdAtMs: createdAt?.toMillis() ?? Date.now()
				};
			});

			onLogs(logs);
		},
		(error) => {
			if (onError) {
				onError(error);
			}
		}
	);
}
