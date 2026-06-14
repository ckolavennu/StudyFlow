import { writable } from 'svelte/store';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '$lib/firebase';
import { upsertUserProfile } from '$lib/services/userProfileService';

type AuthState = {
	user: User | null;
	loading: boolean;
};

export const authState = writable<AuthState>({
	user: null,
	loading: true
});

onAuthStateChanged(auth, (user) => {
	if (user) {
		void upsertUserProfile(user).catch((error) => {
			console.warn('StudyFlow profile sync failed.', error);
		});
	}

	authState.set({
		user,
		loading: false
	});
});
