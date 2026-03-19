import { API_URL } from '../config.js';
export class VietnameseService {
    /**
     * Fetch FSRS cards that are due for review.
     * @param limit maximum number of cards to fetch
     * @returns list of cards ready to be reviewed
     */
    static async getDueReviewCards(limit = 20) {
        const response = await fetch(`${API_URL}/api/sections/vietnamese/review?limit=${limit}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch due review cards: ${response.statusText}`);
        }
        return response.json();
    }
    static async getDeckStats() {
        const response = await fetch(`${API_URL}/api/sections/vietnamese/decks/stats`);
        if (!response.ok) {
            throw new Error(`Failed to fetch deck stats: ${response.statusText}`);
        }
        return response.json();
    }
    /**
     * Submit a rating (1-4) for a flashcard to update its FSRS scheduling.
     * @param cardId the ID of the card being reviewed
     * @param rating the score given (1=Again, 2=Hard, 3=Good, 4=Easy)
     * @returns the updated review state
     */
    static async submitReview(cardId, rating) {
        const response = await fetch(`${API_URL}/api/sections/vietnamese/review`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ card_id: cardId, rating }),
        });
        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.error ?? `Submit review failed: ${response.statusText}`);
        }
        return response.json();
    }
}
