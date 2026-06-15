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
			const profiles = snapshot.docs.map((document) => {
				const data = document.data();
				return {
					...mapUserProfile(document.id, data),
					disabled: Boolean(data.disabled)
				};
			});

			onProfiles(profiles);
		},
		(error) => {
			if (onError) {
				onError(error);
			}
		}
	);
}
