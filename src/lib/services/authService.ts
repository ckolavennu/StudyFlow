import {
	GoogleAuthProvider,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signInWithPopup,
	signOut,
	updateProfile
} from 'firebase/auth';
import { auth } from '$lib/firebase';
import { upsertUserProfile } from '$lib/services/userProfileService';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
	prompt: 'select_account'
});

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

export async function loginWithGoogle() {
	const userCredential = await signInWithPopup(auth, googleProvider);
	await safelySyncUserProfile();
	return userCredential.user;
}

export async function updateCurrentUserName(name: string) {
	const displayName = name.trim();
	const currentUser = auth.currentUser;

	if (!currentUser) {
		throw new Error('You must be logged in to update your name.');
	}

	if (!displayName) {
		throw new Error('Name cannot be empty.');
	}

	await updateProfile(currentUser, { displayName });
	await currentUser.reload();
	await safelySyncUserProfile();

	return auth.currentUser ?? currentUser;
}

export async function logoutUser() {
	await signOut(auth);
}
