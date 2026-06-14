import type { Assignment } from '$lib/types/assignment';
import { getAssignmentStatus, getDaysUntilDeadline } from '$lib/utils/assignmentUtils';

export type StudyFlowNotification = {
	id: string;
	assignmentId: string;
	title: string;
	message: string;
	tone: 'danger' | 'warning' | 'info' | 'success';
	priority: number;
};

export function getAssignmentNotifications(assignments: Assignment[]) {
	const notifications: StudyFlowNotification[] = [];

	for (const assignment of assignments) {
		if (assignment.completed) {
			continue;
		}

		const status = getAssignmentStatus(assignment);
		const daysLeft = getDaysUntilDeadline(assignment.deadlineMs);

		if (status === 'overdue') {
			notifications.push({
				id: `${assignment.id}-overdue`,
				assignmentId: assignment.id,
				title: 'Overdue assignment',
				message: `${assignment.title} has passed its deadline.`,
				tone: 'danger',
				priority: 1
			});
			continue;
		}

		if (status === 'due-today') {
			notifications.push({
				id: `${assignment.id}-today`,
				assignmentId: assignment.id,
				title: 'Due today',
				message: `${assignment.title} is due today.`,
				tone: 'warning',
				priority: 2
			});
			continue;
		}

		if (status === 'due-soon') {
			notifications.push({
				id: `${assignment.id}-soon`,
				assignmentId: assignment.id,
				title: 'Deadline approaching',
				message: `${assignment.title} is due in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}.`,
				tone: 'info',
				priority: 3
			});
		}
	}

	return notifications.sort((a, b) => a.priority - b.priority);
}

export function getNotificationSummary(notifications: StudyFlowNotification[]) {
	const dangerCount = notifications.filter((item) => item.tone === 'danger').length;
	const warningCount = notifications.filter((item) => item.tone === 'warning').length;
	const infoCount = notifications.filter((item) => item.tone === 'info').length;

	if (dangerCount > 0) {
		return `${dangerCount} overdue ${dangerCount === 1 ? 'assignment' : 'assignments'}`;
	}

	if (warningCount > 0) {
		return `${warningCount} due today`;
	}

	if (infoCount > 0) {
		return `${infoCount} coming up soon`;
	}

	return 'No urgent notifications';
}
