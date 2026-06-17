import { auth } from '$lib/firebase';

async function getHeaders() {
	const user = auth.currentUser;

	if (!user) {
		throw new Error('You must be logged in.');
	}

	const token = await user.getIdToken();

	return {
		'Content-Type': 'application/json',
		Authorization: `Bearer ${token}`
	};
}

async function getMessage(response: Response, fallback: string) {
	const data = await response.json().catch(() => null);
	return typeof data?.message === 'string' ? data.message : fallback;
}

export async function removeStudyFlowAccount(uid: string) {
	const response = await fetch(`/api/owner/users/${uid}`, {
		method: 'PATCH',
		headers: await getHeaders(),
		body: JSON.stringify({ action: 'remove' })
	});

	if (!response.ok) {
		throw new Error(await getMessage(response, 'Could not remove account.'));
	}

	return response.json();
}
