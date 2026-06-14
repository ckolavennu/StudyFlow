import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
	type FirestoreError,
	type Timestamp,
	type Unsubscribe
} from 'firebase/firestore';
import { appId, db } from '$lib/firebase';
import type { Subtask, SubtaskInput } from '$lib/types/subtask';

function getSubtasksCollection(userId: string, assignmentId: string) {
	return collection(
		db,
		'artifacts',
		appId,
		'users',
		userId,
		'assignments',
		assignmentId,
		'subtasks'
	);
}

function getSubtaskDocument(userId: string, assignmentId: string, subtaskId: string) {
	return doc(
		db,
		'artifacts',
		appId,
		'users',
		userId,
		'assignments',
		assignmentId,
		'subtasks',
		subtaskId
	);
}

export async function createSubtask(userId: string, assignmentId: string, input: SubtaskInput) {
	const title = input.title.trim();

	if (!userId) {
		throw new Error('Missing user ID.');
	}

	if (!assignmentId) {
		throw new Error('Missing assignment ID.');
	}

	if (!title) {
		throw new Error('Subtask title is required.');
	}

	await addDoc(getSubtasksCollection(userId, assignmentId), {
		title,
		completed: false,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp()
	});
}

export function listenToSubtasks(
	userId: string,
	assignmentId: string,
	onSubtasks: (subtasks: Subtask[]) => void,
	onError?: (error: FirestoreError) => void
): Unsubscribe {
	const subtasksQuery = query(
		getSubtasksCollection(userId, assignmentId),
		orderBy('createdAt', 'asc')
	);

	return onSnapshot(
		subtasksQuery,
		(snapshot) => {
			const subtasks = snapshot.docs.map((document) => {
				const data = document.data();

				const createdAt = data.createdAt as Timestamp | undefined;
				const updatedAt = data.updatedAt as Timestamp | undefined;

				return {
					id: document.id,
					title: typeof data.title === 'string' ? data.title : 'Untitled subtask',
					completed: Boolean(data.completed),
					createdAtMs: createdAt?.toMillis() ?? Date.now(),
					updatedAtMs: updatedAt?.toMillis() ?? Date.now()
				};
			});

			onSubtasks(subtasks);
		},
		(error) => {
			if (onError) {
				onError(error);
			}
		}
	);
}

export async function updateSubtaskCompletion(
	userId: string,
	assignmentId: string,
	subtaskId: string,
	completed: boolean
) {
	await updateDoc(getSubtaskDocument(userId, assignmentId, subtaskId), {
		completed,
		updatedAt: serverTimestamp()
	});
}

export async function deleteSubtask(userId: string, assignmentId: string, subtaskId: string) {
	await deleteDoc(getSubtaskDocument(userId, assignmentId, subtaskId));
}