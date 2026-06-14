import type { Assignment } from '$lib/types/assignment';

export type AssignmentStatus = 'completed' | 'overdue' | 'due-today' | 'due-soon' | 'normal';
export type AssignmentFilter = 'all' | 'active' | 'completed' | 'overdue' | 'due-soon';
export type AssignmentSort = 'deadline-asc' | 'created-desc' | 'created-asc' | 'completed-last';

const dayMs = 1000 * 60 * 60 * 24;

function startOfTodayMs() {
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return today.getTime();
}

function startOfTomorrowMs() {
	return startOfTodayMs() + dayMs;
}

export function getDaysUntilDeadline(deadlineMs: number) {
	return Math.ceil((deadlineMs - Date.now()) / dayMs);
}

export function getAssignmentStatus(assignment: Assignment): AssignmentStatus {
	if (assignment.completed) {
		return 'completed';
	}

	if (assignment.deadlineMs < Date.now()) {
		return 'overdue';
	}

	if (assignment.deadlineMs >= startOfTodayMs() && assignment.deadlineMs < startOfTomorrowMs()) {
		return 'due-today';
	}

	if (getDaysUntilDeadline(assignment.deadlineMs) <= 3) {
		return 'due-soon';
	}

	return 'normal';
}

export function getAssignmentStatusLabel(assignment: Assignment) {
	const status = getAssignmentStatus(assignment);

	if (status === 'completed') {
		return 'Completed';
	}

	if (status === 'overdue') {
		return 'Overdue';
	}

	if (status === 'due-today') {
		return 'Due today';
	}

	const days = getDaysUntilDeadline(assignment.deadlineMs);

	if (days <= 1) {
		return '1 day left';
	}

	return `${days} days left`;
}

export function getAssignmentCardClasses(assignment: Assignment) {
	const status = getAssignmentStatus(assignment);
	const base = 'glass-card group cursor-pointer rounded-3xl p-5 transition hover:-translate-y-1 hover:bg-white/15';

	if (status === 'completed') {
		return `${base} border-emerald-300/25 bg-emerald-400/10 opacity-80`;
	}

	if (status === 'overdue') {
		return `${base} border-red-300/40 bg-red-500/10 shadow-red-500/10`;
	}

	if (status === 'due-today') {
		return `${base} border-pink-300/40 bg-pink-500/10 shadow-pink-500/10`;
	}

	if (status === 'due-soon') {
		return `${base} border-yellow-200/35 bg-yellow-300/10 shadow-yellow-300/10`;
	}

	return base;
}

export function getAssignmentBadgeClasses(assignment: Assignment) {
	const status = getAssignmentStatus(assignment);
	const base = 'rounded-full border px-3 py-1 text-xs font-semibold';

	if (status === 'completed') {
		return `${base} border-emerald-300/30 bg-emerald-400/10 text-emerald-100`;
	}

	if (status === 'overdue') {
		return `${base} border-red-300/40 bg-red-500/15 text-red-100`;
	}

	if (status === 'due-today') {
		return `${base} border-pink-300/40 bg-pink-500/15 text-pink-100`;
	}

	if (status === 'due-soon') {
		return `${base} border-yellow-200/40 bg-yellow-300/15 text-yellow-100`;
	}

	return `${base} border-cyan-300/30 bg-cyan-400/10 text-cyan-100`;
}

export function filterAssignments(assignments: Assignment[], filter: AssignmentFilter) {
	if (filter === 'all') {
		return assignments;
	}

	return assignments.filter((assignment) => {
		const status = getAssignmentStatus(assignment);

		if (filter === 'active') {
			return !assignment.completed;
		}

		if (filter === 'due-soon') {
			return status === 'due-soon' || status === 'due-today';
		}

		return status === filter;
	});
}

export function sortAssignments(assignments: Assignment[], sort: AssignmentSort) {
	return [...assignments].sort((a, b) => {
		if (sort === 'created-desc') {
			return b.createdAtMs - a.createdAtMs;
		}

		if (sort === 'created-asc') {
			return a.createdAtMs - b.createdAtMs;
		}

		if (sort === 'completed-last') {
			if (a.completed !== b.completed) {
				return Number(a.completed) - Number(b.completed);
			}

			return a.deadlineMs - b.deadlineMs;
		}

		return a.deadlineMs - b.deadlineMs;
	});
}

export function getVisibleAssignments(
	assignments: Assignment[],
	filter: AssignmentFilter,
	sort: AssignmentSort
) {
	return sortAssignments(filterAssignments(assignments, filter), sort);
}
