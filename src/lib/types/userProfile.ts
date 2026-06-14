export type UserRole = 'user' | 'super-admin';

export type UserProfile = {
	uid: string;
	name: string;
	email: string;
	role: UserRole;
	createdAtMs: number;
	lastLoginAtMs: number;
	assignmentCount: number;
	completedCount: number;
	activeCount: number;
	overdueCount: number;
};
