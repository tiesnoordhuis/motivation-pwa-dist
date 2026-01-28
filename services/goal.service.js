const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocal
    ? 'http://localhost:3000'
    : 'http://192.168.178.170:3000';
export class GoalService {
    static async fetchGoals() {
        const response = await fetch(`${API_URL}/api/goals`);
        if (!response.ok) {
            throw new Error(`Failed to fetch goals: ${response.statusText}`);
        }
        return response.json();
    }
}
