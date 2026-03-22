export interface Goal {
    id: string;
    parent_id?: string;
    title: string;
    description?: string;
    status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
    created_at: string;
    updated_at: string;
    sub_goals?: Goal[];
}
export type NewGoal = Omit<Goal, 'id' | 'created_at' | 'updated_at'>;
export * from './types/agenda.js';
export * from './types/social.js';
export * from './types/vietnamese.js';
export * from './types/health.js';
export * from './types/projects.js';
