export interface Deck {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
}
export type NewDeck = Omit<Deck, 'id' | 'created_at' | 'updated_at'>;
export interface Card {
    id: string;
    deck_id: string;
    front: string;
    back: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}
export type NewCard = Omit<Card, 'id' | 'created_at' | 'updated_at'>;
export type ReviewState = 'new' | 'learning' | 'review' | 'relearning';
export interface Review {
    id: string;
    card_id: string;
    state: ReviewState;
    stability: number;
    difficulty: number;
    scheduled_days: number;
    elapsed_days: number;
    rating?: number;
    due: string;
    last_review?: string;
    created_at: string;
}
export type NewReview = Omit<Review, 'id' | 'created_at'>;
