export type UserProfile = {
	uid: string;
	name: string;
	email: string;
	createdAtMs: number;
	lastLoginAtMs: number;
	assignmentCount: number;
	completedCount: number;
	activeCount: number;
	overdueCount: number;
};
