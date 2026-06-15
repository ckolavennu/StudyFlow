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

export async function createAccount(input: { name: string; email: string; password: string }) {
	const response = await fetch('/api/owner/users', {
		method: 'POST',
		headers: await getHeaders(),
		body: JSON.stringify(input)
	});

	if (!response.ok) {
		throw new Error(await getMessage(response, 'Could not create account.'));
	}

	return response.json();
}

export async function changeAccountPassword(uid: string, password: string) {
	const response = await fetch(`/api/owner/users/${uid}`, {
		method: 'PATCH',
		headers: await getHeaders(),
		body: JSON.stringify({ action: 'password', password })
	});

	if (!response.ok) {
		throw new Error(await getMessage(response, 'Could not update account.'));
	}

	return response.json();
}

export async function suspendAccount(uid: string) {
	const response = await fetch(`/api/owner/users/${uid}`, {
		method: 'PATCH',
		headers: await getHeaders(),
		body: JSON.stringify({ action: 'disable' })
	});

	if (!response.ok) {
		throw new Error(await getMessage(response, 'Could not update account.'));
	}

	return response.json();
}

export async function restoreAccount(uid: string) {
	const response = await fetch(`/api/owner/users/${uid}`, {
		method: 'PATCH',
		headers: await getHeaders(),
		body: JSON.stringify({ action: 'enable' })
	});

	if (!response.ok) {
		throw new Error(await getMessage(response, 'Could not update account.'));
	}

	return response.json();
}
