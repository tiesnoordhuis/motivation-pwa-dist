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
    // --- Nutrition ---
    static async fetchNutritionByDate(date) {
        const response = await fetch(`${API_URL}/api/sections/health/nutrition?date=${date}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch nutrition: ${response.statusText}`);
        }
        return response.json();
    }
    static async fetchNutritionSummary(from, to) {
        const response = await fetch(`${API_URL}/api/sections/health/nutrition/summary?from=${from}&to=${to}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch nutrition summary: ${response.statusText}`);
        }
        return response.json();
    }
    static async createNutritionEntry(entry) {
        const response = await fetch(`${API_URL}/api/sections/health/nutrition`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry),
        });
        if (!response.ok) {
            throw new Error(`Failed to create nutrition entry: ${response.statusText}`);
        }
        return response.json();
    }
    static async deleteNutritionEntry(id) {
        const response = await fetch(`${API_URL}/api/sections/health/nutrition/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Failed to delete nutrition entry: ${response.statusText}`);
        }
    }
    // --- AI Estimation ---
    static async estimateNutrition(description, image) {
        const body = { description };
        if (image)
            body.image = image;
        const response = await fetch(`${API_URL}/api/sections/health/nutrition/estimate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error ?? `Estimation failed: ${response.statusText}`);
        }
        return response.json();
    }
    static async getOllamaStatus() {
        const response = await fetch(`${API_URL}/api/sections/health/nutrition/ollama-status`);
        if (!response.ok)
            return { running: false };
        return response.json();
    }
}
