export function formatProjectStatusLabel(status) {
    if (status === 'in_progress')
        return 'In progress';
    if (status === 'done')
        return 'Done';
    if (status === 'superseded')
        return 'Superseded';
    if (status === 'unknown')
        return 'Unknown';
    return 'Todo';
}
export function projectStatusClass(status) {
    return `status status--${status.replace('_', '-')}`;
}
