import { API_URL } from '../config.js';
export class ProjectsService {
    static async fetchMotivationSummary() {
        const response = await fetch(`${API_URL}/api/sections/projects/motivation/summary`);
        if (!response.ok) {
            throw new Error(`Failed to fetch motivation summary: ${response.statusText}`);
        }
        return response.json();
    }
    static async fetchMotivationDashboard() {
        const response = await fetch(`${API_URL}/api/sections/projects/motivation`);
        if (!response.ok) {
            throw new Error(`Failed to fetch motivation dashboard: ${response.statusText}`);
        }
        return response.json();
    }
    static async fetchMotivationStories() {
        const response = await fetch(`${API_URL}/api/sections/projects/motivation/stories`);
        if (!response.ok) {
            throw new Error(`Failed to fetch motivation stories: ${response.statusText}`);
        }
        return response.json();
    }
    static async fetchMotivationGitLog() {
        const response = await fetch(`${API_URL}/api/sections/projects/motivation/git-log`);
        if (!response.ok) {
            throw new Error(`Failed to fetch motivation git log: ${response.statusText}`);
        }
        return response.json();
    }
}
