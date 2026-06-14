import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	updateProfile
} from 'firebase/auth';
import { auth } from '$lib/firebase';

export async function registerUser(name: string, email: string, password: string) {
	const userCredential = await createUserWithEmailAndPassword(auth, email, password);

	const displayName = name.trim();

	if (displayName) {
		await updateProfile(userCredential.user, {
			displayName
		});

		await userCredential.user.reload();
	}

	return auth.currentUser ?? userCredential.user;
}

export async function loginUser(email: string, password: string) {
	const userCredential = await signInWithEmailAndPassword(auth, email, password);
	return userCredential.user;
}

export async function logoutUser() {
	await signOut(auth);
}