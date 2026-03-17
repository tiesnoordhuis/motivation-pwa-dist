export interface Person {
    id: string;
    name: string;
    relationship?: string;
    notes?: string;
    photo_url?: string;
    created_at: string;
    updated_at: string;
}
export type NewPerson = Omit<Person, 'id' | 'created_at' | 'updated_at'>;
export interface ImportantDate {
    id: string;
    person_id: string;
    label: string;
    date: string;
    recurring: boolean;
    created_at: string;
}
export type NewImportantDate = Omit<ImportantDate, 'id' | 'created_at'>;
export type InteractionType = 'in_person' | 'message' | 'call' | 'video';
export interface Interaction {
    id: string;
    person_id: string;
    type: InteractionType;
    date: string;
    notes?: string;
    created_at: string;
}
export type NewInteraction = Omit<Interaction, 'id' | 'created_at'>;
