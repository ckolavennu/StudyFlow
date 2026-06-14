import { doc, getDoc, serverTimestamp, setDoc, type Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { appId, db } from '$lib/firebase';
import type { UserProfile, UserRole } from '$lib/types/userProfile';
import type { Assignment } from '$lib/types/assignment';
import { getAssignmentStatus } from '$lib/utils/assignmentUtils';
import { isSuperAdmin } from '$lib/utils/adminUtils';

function getUserProfileDocument(userId: string) {
	return doc(db, 'artifacts', appId, 'userProfiles', userId);
}

function getSafeDisplayName(user: User) {
	if (user.displayName?.trim()) {
		return user.displayName.trim();
	}

	if (user.email?.trim()) {
		return user.email.split('@')[0];
	}

	return 'StudyFlow User';
}

export async function upsertUserProfile(user: User) {
	const profileDocument = getUserProfileDocument(user.uid);
	const snapshot = await getDoc(profileDocument);
	const isAdmin = isSuperAdmin(user.uid);

	const profileData = {
		uid: user.uid,
		name: getSafeDisplayName(user),
		email: user.email ?? '',
		role: isAdmin ? 'super-admin' : 'user',
		lastLoginAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
		...(isAdmin
			? {
					assignmentCount: 0,
					completedCount: 0,
					activeCount: 0,
					overdueCount: 0
				}
			: {})
	};

	if (snapshot.exists()) {
		await setDoc(profileDocument, profileData, { merge: true });
		return;
	}

	await setDoc(
		profileDocument,
		{
			...profileData,
			createdAt: serverTimestamp(),
			assignmentCount: 0,
			completedCount: 0,
			activeCount: 0,
			overdueCount: 0
		},
		{ merge: true }
	);
}

export async function updateUserProfileAssignmentStats(userId: string, assignments: Assignment[]) {
	if (!userId || isSuperAdmin(userId)) {
		return;
	}

	const completedCount = assignments.filter((assignment) => assignment.completed).length;
	const activeCount = assignments.length - completedCount;
	const overdueCount = assignments.filter(
		(assignment) => getAssignmentStatus(assignment) === 'overdue'
	).length;

	await setDoc(
		getUserProfileDocument(userId),
		{
			role: 'user',
			assignmentCount: assignments.length,
			completedCount,
			activeCount,
			overdueCount,
			updatedAt: serverTimestamp()
		},
		{ merge: true }
	);
}

export function mapUserProfile(id: string, data: Record<string, unknown>): UserProfile {
	const createdAt = data.createdAt as Timestamp | undefined;
	const lastLoginAt = data.lastLoginAt as Timestamp | undefined;
	const role: UserRole = data.role === 'super-admin' || isSuperAdmin(id) ? 'super-admin' : 'user';

	return {
		uid: typeof data.uid === 'string' ? data.uid : id,
		name: typeof data.name === 'string' ? data.name : 'StudyFlow User',
		email: typeof data.email === 'string' ? data.email : '',
		role,
		createdAtMs: createdAt?.toMillis() ?? Date.now(),
		lastLoginAtMs: lastLoginAt?.toMillis() ?? Date.now(),
		assignmentCount: role === 'super-admin' ? 0 : typeof data.assignmentCount === 'number' ? data.assignmentCount : 0,
		completedCount: role === 'super-admin' ? 0 : typeof data.completedCount === 'number' ? data.completedCount : 0,
		activeCount: role === 'super-admin' ? 0 : typeof data.activeCount === 'number' ? data.activeCount : 0,
		overdueCount: role === 'super-admin' ? 0 : typeof data.overdueCount === 'number' ? data.overdueCount : 0
	};
}
