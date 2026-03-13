import { API_URL } from '../config.js';
export class HealthService {
    static async fetchActivities(from, to) {
        const params = from && to ? `?from=${from}&to=${to}` : '';
        const response = await fetch(`${API_URL}/api/sections/health/activities${params}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch activities: ${response.statusText}`);
        }
        return response.json();
    }
    static async fetchCalendarActivities(daysAhead = 30, daysBehind = 30) {
        const response = await fetch(`${API_URL}/api/sections/health/calendar-activities?days_ahead=${daysAhead}&days_behind=${daysBehind}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch calendar activities: ${response.statusText}`);
        }
        return response.json();
    }
    static async createActivity(activity) {
        const response = await fetch(`${API_URL}/api/sections/health/activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...activity, source: activity.source ?? 'manual' }),
        });
        if (!response.ok) {
            throw new Error(`Failed to create activity: ${response.statusText}`);
        }
        return response.json();
    }
    static async deleteActivity(id) {
        const response = await fetch(`${API_URL}/api/sections/health/activities/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Failed to delete activity: ${response.statusText}`);
        }
    }
}
