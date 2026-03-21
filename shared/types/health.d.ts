export declare const MEAL_TYPES: readonly ["Breakfast", "Lunch", "Dinner", "Snacks"];
export type MealType = typeof MEAL_TYPES[number];
export declare const ACTIVITY_TYPES: readonly ["workout", "running", "cycling", "swimming", "gym", "tennis", "ice-skating", "walking"];
export type ActivityType = typeof ACTIVITY_TYPES[number];
export type ActivitySource = 'manual' | 'strava' | 'calendar';
export interface Activity {
    id: string;
    type: ActivityType;
    source: ActivitySource;
    title: string;
    description?: string;
    date: string;
    duration_minutes?: number;
    calories_burned?: number;
    external_id?: string;
    metadata?: string;
    created_at: string;
    updated_at: string;
}
export type NewActivity = Omit<Activity, 'id' | 'created_at' | 'updated_at'>;
export type NutritionSource = 'manual' | 'openfoodfacts' | 'ai_estimate' | 'mfp_import';
export interface NutritionEntry {
    id: number;
    date: string;
    meal_type: MealType;
    food_name: string;
    serving_size?: string;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    fiber_g?: number;
    sugar_g?: number;
    sodium_mg?: number;
    source: NutritionSource;
    source_ref?: string;
    created_at: string;
}
export type NewNutritionEntry = Omit<NutritionEntry, 'id' | 'created_at'>;
export interface DailyNutritionSummary {
    date: string;
    total_calories: number;
    total_protein_g: number;
    total_carbs_g: number;
    total_fat_g: number;
    entry_count: number;
}
export interface NutritionEstimate {
    food_name: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
    sugar_g: number;
    confidence: 'high' | 'medium' | 'low';
    notes: string;
}
export interface FoodLibraryItem {
    id: number;
    canonical_name: string;
    display_name: string;
    brands?: string;
    barcode?: string;
    serving_label?: string;
    serving_quantity?: number;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    fiber_g?: number;
    sugar_g?: number;
    sodium_mg?: number;
    per_100g_json?: string;
    default_amount_json?: string;
    source: NutritionSource;
    source_ref?: string;
    raw_json?: string;
    use_count: number;
    last_used_at: string;
    created_at: string;
    updated_at: string;
}
export type NewFoodLibraryItem = Omit<FoodLibraryItem, 'id' | 'created_at' | 'updated_at' | 'last_used_at'> & {
    last_used_at?: string;
};
