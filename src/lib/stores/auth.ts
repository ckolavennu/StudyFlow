import { writable } from 'svelte/store';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '$lib/firebase';

type AuthState = {
	user: User | null;
	loading: boolean;
};

export const authState = writable<AuthState>({
	user: null,
	loading: true
});

onAuthStateChanged(auth, (user) => {
	authState.set({
		user,
		loading: false
	});
});