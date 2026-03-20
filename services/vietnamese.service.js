import { API_URL } from '../config.js';
export class VietnameseService {
    static async request(path, init) {
        const response = await fetch(`${API_URL}${path}`, init);
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error ?? response.statusText ?? 'Request failed');
        }
        if (response.status === 204) {
            return undefined;
        }
        return response.json();
    }
    /**
     * Fetch FSRS cards that are due for review.
     * @param limit maximum number of cards to fetch
     * @returns list of cards ready to be reviewed
     */
    static async getDueReviewCards(limit = 20) {
        return this.request(`/api/sections/vietnamese/review?limit=${limit}`);
    }
    static async getDeckStats() {
        return this.request('/api/sections/vietnamese/decks/stats');
    }
    static async getDecks() {
        return this.request('/api/sections/vietnamese/decks');
    }
    static async createDeck(payload) {
        return this.request('/api/sections/vietnamese/decks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }
    static async updateDeck(id, payload) {
        return this.request(`/api/sections/vietnamese/decks/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }
    static async deleteDeck(id) {
        await this.request(`/api/sections/vietnamese/decks/${id}`, { method: 'DELETE' });
    }
    static async getCardsByDeck(deckId) {
        return this.request(`/api/sections/vietnamese/decks/${deckId}/cards`);
    }
    static async createCard(deckId, payload) {
        return this.request(`/api/sections/vietnamese/decks/${deckId}/cards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }
    static async updateCard(id, payload) {
        return this.request(`/api/sections/vietnamese/cards/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
    }
    static async deleteCard(id) {
        await this.request(`/api/sections/vietnamese/cards/${id}`, { method: 'DELETE' });
    }
    /**
     * Submit a rating (1-4) for a flashcard to update its FSRS scheduling.
     * @param cardId the ID of the card being reviewed
     * @param rating the score given (1=Again, 2=Hard, 3=Good, 4=Easy)
     * @returns the updated review state
     */
    static async submitReview(cardId, rating) {
        return this.request('/api/sections/vietnamese/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ card_id: cardId, rating }),
        });
    }
}
