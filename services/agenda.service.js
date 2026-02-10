const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocal
    ? 'http://localhost:3000'
    : 'http://192.168.178.170:3000';
export class AgendaService {
    static async fetchEvents() {
        const response = await fetch(`${API_URL}/api/agenda`);
        if (!response.ok) {
            throw new Error(`Failed to fetch agenda: ${response.statusText}`);
        }
        return response.json();
    }
}
