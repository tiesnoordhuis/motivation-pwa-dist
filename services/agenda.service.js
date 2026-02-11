import { API_URL } from '../config.js';
export class AgendaService {
    static async fetchEvents() {
        const response = await fetch(`${API_URL}/api/agenda`);
        if (!response.ok) {
            throw new Error(`Failed to fetch agenda: ${response.statusText}`);
        }
        return response.json();
    }
}
