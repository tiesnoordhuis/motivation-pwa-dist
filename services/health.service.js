import { API_URL } from '../config.js';
export class HealthService {
    static async fetchDashboardActivities() {
        const response = await fetch(`${API_URL}/api/sections/health/activities`);
        if (!response.ok) {
            throw new Error(`Failed to fetch activities: ${response.statusText}`);
        }
        return response.json();
    }
    static async fetchActivitiesByRange(from, to) {
        const response = await fetch(`${API_URL}/api/sections/health/activities?from=${from}&to=${to}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch activities: ${response.statusText}`);
        }
        return response.json();
    }
    static async fetchActivitiesByDate(date) {
        const response = await fetch(`${API_URL}/api/sections/health/activities?date=${date}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch activities: ${response.statusText}`);
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
    static async updateActivity(id, updates) {
        const response = await fetch(`${API_URL}/api/sections/health/activities/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!response.ok) {
            throw new Error(`Failed to update activity: ${response.statusText}`);
        }
        return response.json();
    }
    // --- Nutrition ---
    static async fetchNutritionByDate(date) {
        const response = await fetch(`${API_URL}/api/sections/health/nutrition?date=${date}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch nutrition: ${response.statusText}`);
        }
        return response.json();
    }
    static async fetchNutritionByDateRange(from, to) {
        const response = await fetch(`${API_URL}/api/sections/health/nutrition?from=${from}&to=${to}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch nutrition range: ${response.statusText}`);
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
    static async updateNutritionEntry(id, updates) {
        const response = await fetch(`${API_URL}/api/sections/health/nutrition/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!response.ok) {
            throw new Error(`Failed to update nutrition entry: ${response.statusText}`);
        }
        return response.json();
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
    // --- Food Library ---
    static async fetchFoodLibrarySearch(query, limit = 10) {
        const response = await fetch(`${API_URL}/api/sections/health/food-library/search?q=${encodeURIComponent(query)}&limit=${limit}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch food library search: ${response.statusText}`);
        }
        return response.json();
    }
    static async fetchFoodLibraryRecent(limit = 10) {
        const response = await fetch(`${API_URL}/api/sections/health/food-library/recent?limit=${limit}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch recent food library items: ${response.statusText}`);
        }
        return response.json();
    }
    static async fetchFoodLibraryFrequent(limit = 10) {
        const response = await fetch(`${API_URL}/api/sections/health/food-library/frequent?limit=${limit}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch frequent food library items: ${response.statusText}`);
        }
        return response.json();
    }
    static async fetchFoodLibraryByBarcode(barcode) {
        const response = await fetch(`${API_URL}/api/sections/health/food-library/barcode/${encodeURIComponent(barcode)}`);
        if (response.status === 404) {
            return null;
        }
        if (!response.ok) {
            throw new Error(`Failed to fetch food library barcode: ${response.statusText}`);
        }
        return response.json();
    }
}
