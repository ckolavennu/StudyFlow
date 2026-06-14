import {
	collection,
	onSnapshot,
	orderBy,
	query,
	type FirestoreError,
	type Unsubscribe
} from 'firebase/firestore';
import { appId, db } from '$lib/firebase';
import type { UserProfile } from '$lib/types/userProfile';
import { mapUserProfile } from '$lib/services/userProfileService';

function getProfilesCollection() {
	return collection(db, 'artifacts', appId, 'userProfiles');
}

export function listenToProfiles(
	onProfiles: (profiles: UserProfile[]) => void,
	onError?: (error: FirestoreError) => void
): Unsubscribe {
	const profilesQuery = query(getProfilesCollection(), orderBy('lastLoginAt', 'desc'));

	return onSnapshot(
		profilesQuery,
		(snapshot) => {
			const profiles = snapshot.docs.map((document) => mapUserProfile(document.id, document.data()));
			onProfiles(profiles);
		},
		(error) => {
			if (onError) {
				onError(error);
			}
		}
	);
}
