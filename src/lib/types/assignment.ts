export type Assignment = {
	id: string;
	title: string;
	description: string;
	deadlineMs: number;
	createdAtMs: number;
	completed: boolean;
};

export type AssignmentInput = {
	title: string;
	description: string;
	deadline: string;
};