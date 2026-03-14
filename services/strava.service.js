import { API_URL } from '../config.js';
export class StravaService {
    static async getAuthUrl() {
        const redirectUri = `${window.location.origin}${window.location.pathname}`;
        let response;
        try {
            response = await fetch(`${API_URL}/api/connected-services/strava/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`);
        }
        catch {
            throw new Error(`Failed to reach API at ${API_URL}. Check VPN/local network and CORS/PNA settings.`);
        }
        if (!response.ok)
            throw new Error(`Failed to get auth URL: ${response.statusText}`);
        const data = await response.json();
        return data.url;
    }
    static async exchangeCode(code) {
        const response = await fetch(`${API_URL}/api/connected-services/strava/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code }),
        });
        if (!response.ok)
            throw new Error(`Token exchange failed: ${response.statusText}`);
    }
    static async getStatus() {
        const response = await fetch(`${API_URL}/api/connected-services/strava/status`);
        if (!response.ok)
            throw new Error(`Failed to get Strava status: ${response.statusText}`);
        return response.json();
    }
    static async sync() {
        const response = await fetch(`${API_URL}/api/connected-services/strava/sync`, {
            method: 'POST',
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error ?? `Sync failed: ${response.statusText}`);
        }
        return response.json();
    }
    static async disconnect() {
        const response = await fetch(`${API_URL}/api/connected-services/strava/disconnect`, {
            method: 'POST',
        });
        if (!response.ok)
            throw new Error(`Disconnect failed: ${response.statusText}`);
    }
}
