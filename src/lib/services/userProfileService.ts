import { doc, getDoc, serverTimestamp, setDoc, type Timestamp } from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { appId, db } from '$lib/firebase';
import type { UserProfile } from '$lib/types/userProfile';

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

	const profileData = {
		uid: user.uid,
		name: getSafeDisplayName(user),
		email: user.email ?? '',
		lastLoginAt: serverTimestamp(),
		updatedAt: serverTimestamp()
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

export function mapUserProfile(id: string, data: Record<string, unknown>): UserProfile {
	const createdAt = data.createdAt as Timestamp | undefined;
	const lastLoginAt = data.lastLoginAt as Timestamp | undefined;

	return {
		uid: typeof data.uid === 'string' ? data.uid : id,
		name: typeof data.name === 'string' ? data.name : 'StudyFlow User',
		email: typeof data.email === 'string' ? data.email : '',
		createdAtMs: createdAt?.toMillis() ?? Date.now(),
		lastLoginAtMs: lastLoginAt?.toMillis() ?? Date.now(),
		assignmentCount: typeof data.assignmentCount === 'number' ? data.assignmentCount : 0,
		completedCount: typeof data.completedCount === 'number' ? data.completedCount : 0,
		activeCount: typeof data.activeCount === 'number' ? data.activeCount : 0,
		overdueCount: typeof data.overdueCount === 'number' ? data.overdueCount : 0
	};
}
