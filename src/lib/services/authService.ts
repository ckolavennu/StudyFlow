import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
	updateProfile
} from 'firebase/auth';
import { auth } from '$lib/firebase';
import { upsertUserProfile } from '$lib/services/userProfileService';

async function safelySyncUserProfile() {
	const currentUser = auth.currentUser;

	if (!currentUser) {
		return;
	}

	try {
		await upsertUserProfile(currentUser);
	} catch (error) {
		console.warn('Could not sync StudyFlow user profile.', error);
	}
}

export async function registerUser(name: string, email: string, password: string) {
	const userCredential = await createUserWithEmailAndPassword(auth, email, password);

	const displayName = name.trim();

	if (displayName) {
		await updateProfile(userCredential.user, {
			displayName
		});

		await userCredential.user.reload();
	}

	await safelySyncUserProfile();

	return auth.currentUser ?? userCredential.user;
}

export async function loginUser(email: string, password: string) {
	const userCredential = await signInWithEmailAndPassword(auth, email, password);
	await safelySyncUserProfile();
	return userCredential.user;
}

export async function logoutUser() {
	await signOut(auth);
}
