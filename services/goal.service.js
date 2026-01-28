// Toggle this manual flag for production build until we have environment variables
const IS_PROD = false;
const API_URL = IS_PROD
    ? 'http://192.168.178.170:3000'
    : 'http://localhost:3000';
export class GoalService {
    static async fetchGoals() {
        const response = await fetch(`${API_URL}/api/goals`);
        if (!response.ok) {
            throw new Error(`Failed to fetch goals: ${response.statusText}`);
        }
        return response.json();
    }
}
