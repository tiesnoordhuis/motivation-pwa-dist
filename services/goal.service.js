import { API_URL } from '../config.js';
export class GoalService {
    static async fetchGoals() {
        const response = await fetch(`${API_URL}/api/goals`);
        if (!response.ok) {
            throw new Error(`Failed to fetch goals: ${response.statusText}`);
        }
        return response.json();
    }
    static async createGoal(goal) {
        const response = await fetch(`${API_URL}/api/goals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(goal)
        });
        if (!response.ok) {
            throw new Error(`Failed to create goal: ${response.statusText}`);
        }
        return response.json();
    }
    static async updateGoal(id, updates) {
        const response = await fetch(`${API_URL}/api/goals/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!response.ok) {
            throw new Error(`Failed to update goal: ${response.statusText}`);
        }
        return response.json();
    }
    static async deleteGoal(id) {
        const response = await fetch(`${API_URL}/api/goals/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`Failed to delete goal: ${response.statusText}`);
        }
    }
}
