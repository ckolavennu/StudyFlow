import {
	Timestamp,
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
	type Unsubscribe
} from 'firebase/firestore';
import { appId, db } from '$lib/firebase';
import type { Assignment, AssignmentInput } from '$lib/types/assignment';

function getAssignmentsCollection(userId: string) {
	return collection(db, 'artifacts', appId, 'users', userId, 'assignments');
}

function getAssignmentDocument(userId: string, assignmentId: string) {
	return doc(db, 'artifacts', appId, 'users', userId, 'assignments', assignmentId);
}

export async function createAssignment(userId: string, input: AssignmentInput) {
	const title = input.title.trim();
	const description = input.description.trim();
	const deadlineDate = new Date(input.deadline);

	if (!userId) {
		throw new Error('Missing user ID.');
	}

	if (!title) {
		throw new Error('Assignment title is required.');
	}

	if (Number.isNaN(deadlineDate.getTime())) {
		throw new Error('Please select a valid deadline.');
	}

	await addDoc(getAssignmentsCollection(userId), {
		title,
		description,
		deadline: Timestamp.fromDate(deadlineDate),
		completed: false,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp()
	});
}

export function listenToAssignments(
	userId: string,
	onAssignments: (assignments: Assignment[]) => void,
	onError?: (error: FirestoreError) => void
): Unsubscribe {
	const assignmentsQuery = query(getAssignmentsCollection(userId), orderBy('deadline', 'asc'));

	return onSnapshot(
		assignmentsQuery,
		(snapshot) => {
			const assignments = snapshot.docs.map((document) => {
				const data = document.data();

				const deadline = data.deadline as Timestamp | undefined;
				const createdAt = data.createdAt as Timestamp | undefined;

				return {
					id: document.id,
					title: typeof data.title === 'string' ? data.title : 'Untitled Assignment',
					description: typeof data.description === 'string' ? data.description : '',
					deadlineMs: deadline?.toMillis() ?? Date.now(),
					createdAtMs: createdAt?.toMillis() ?? Date.now(),
					completed: Boolean(data.completed)
				};
			});

			onAssignments(assignments);
		},
		(error) => {
			if (onError) {
				onError(error);
			}
		}
	);
}

export async function updateAssignmentCompletion(
	userId: string,
	assignmentId: string,
	completed: boolean
) {
	await updateDoc(getAssignmentDocument(userId, assignmentId), {
		completed,
		updatedAt: serverTimestamp()
	});
}

export async function deleteAssignment(userId: string, assignmentId: string) {
	await deleteDoc(getAssignmentDocument(userId, assignmentId));
}