export interface Deck {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
}
export type NewDeck = Omit<Deck, 'id' | 'created_at' | 'updated_at'>;
export interface DeckStat {
    id: string;
    name: string;
    description: string | null;
    total_cards: number;
    due_cards: number;
    new_cards: number;
}
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
export declare const REVIEW_STATES: readonly ["new", "learning", "review", "relearning"];
export type ReviewState = typeof REVIEW_STATES[number];
export declare const RATINGS: readonly [1, 2, 3, 4];
export type Rating = typeof RATINGS[number];
export interface Review {
    id: string;
    card_id: string;
    state: ReviewState;
    stability: number;
    difficulty: number;
    scheduled_days: number;
    elapsed_days: number;
    rating?: Rating;
    due: string;
    last_review?: string | null;
    created_at: string;
}
export type NewReview = Omit<Review, 'id' | 'created_at'>;
