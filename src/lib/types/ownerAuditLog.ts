export type OwnerAuditAction =
	| 'account_created'
	| 'account_password_updated'
	| 'account_suspended'
	| 'account_restored'
	| 'account_removed';

export type OwnerAuditLog = {
	id: string;
	action: OwnerAuditAction;
	actorUid: string;
	actorEmail: string;
	targetUid: string;
	targetEmail: string;
	targetName: string;
	message: string;
	createdAtMs: number;
};
