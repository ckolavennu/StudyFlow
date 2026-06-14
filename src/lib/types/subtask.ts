export type Subtask = {
	id: string;
	title: string;
	completed: boolean;
	createdAtMs: number;
	updatedAtMs: number;
};

export type SubtaskInput = {
	title: string;
};