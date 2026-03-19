export function activityIcon(type) {
    switch (type) {
        case 'gym': return '🏋️';
        case 'tennis': return '🎾';
        case 'ice-skating': return '⛸️';
        case 'running': return '🏃';
        case 'cycling': return '🚴';
        case 'swimming': return '🏊';
        default: return '💪';
    }
}
export function formatDate(dateStr) {
    const d = Temporal.PlainDate.from(dateStr.split('T')[0]);
    return d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
export function formatTime(isoStr) {
    const zdt = Temporal.Instant.from(isoStr).toZonedDateTimeISO(Temporal.Now.timeZoneId());
    return zdt.toLocaleString(undefined, { hour: '2-digit', minute: '2-digit' });
}
export function getDefaultMealType() {
    const hour = Temporal.Now.plainTimeISO().hour;
    if (hour < 11)
        return 'Breakfast';
    if (hour < 15)
        return 'Lunch';
    if (hour < 21)
        return 'Dinner';
    return 'Snacks';
}
