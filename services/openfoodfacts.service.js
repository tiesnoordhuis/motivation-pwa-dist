import { API_URL } from '../config.js';
const OFF_PROXY_BASE = `${API_URL}/api/sections/health/openfoodfacts`;
function parseNutriments(nutriments) {
    return {
        calories_per_100g: nutriments['energy-kcal_100g'] ?? 0,
        protein_per_100g: nutriments['proteins_100g'] ?? 0,
        carbs_per_100g: nutriments['carbohydrates_100g'] ?? 0,
        fat_per_100g: nutriments['fat_100g'] ?? 0,
        fiber_per_100g: nutriments['fiber_100g'] ?? 0,
        sugar_per_100g: nutriments['sugars_100g'] ?? 0,
        sodium_per_100g: nutriments['sodium_100g'] ?? 0,
    };
}
export class OpenFoodFactsService {
    static async lookupBarcode(barcode) {
        try {
            const response = await fetch(`${OFF_PROXY_BASE}/product/${barcode}`);
            if (!response.ok)
                return null;
            const data = await response.json();
            if (data.status !== 1 || !data.product)
                return null;
            const p = data.product;
            return {
                product_name: p.product_name ?? 'Unknown Product',
                brands: p.brands || undefined,
                image_url: p.image_front_url || undefined,
                barcode,
                serving_size: p.serving_size || undefined,
                serving_quantity: typeof p.serving_quantity === 'number' ? p.serving_quantity : undefined,
                quantity: p.quantity || undefined,
                product_quantity: typeof p.product_quantity === 'number' ? p.product_quantity
                    : typeof p.product_quantity === 'string' ? parseFloat(p.product_quantity) || undefined
                        : undefined,
                categories_tags: Array.isArray(p.categories_tags) ? p.categories_tags : undefined,
                ...parseNutriments(p.nutriments ?? {}),
            };
        }
        catch {
            return null;
        }
    }
    static async searchFood(query) {
        try {
            const fetchProducts = async (params) => {
                const response = await fetch(`${OFF_PROXY_BASE}/search?${params}`);
                if (!response.ok)
                    return [];
                const data = await response.json();
                if (!data.products || !Array.isArray(data.products))
                    return [];
                return data.products.map((p) => ({
                    product_name: p.product_name ?? 'Unknown Product',
                    brands: p.brands || undefined,
                    image_url: p.image_front_url || undefined,
                    barcode: p.code || undefined,
                    serving_size: p.serving_size || undefined,
                    serving_quantity: typeof p.serving_quantity === 'number' ? p.serving_quantity : undefined,
                    quantity: p.quantity || undefined,
                    product_quantity: typeof p.product_quantity === 'number' ? p.product_quantity
                        : typeof p.product_quantity === 'string' ? parseFloat(p.product_quantity) || undefined
                            : undefined,
                    categories_tags: Array.isArray(p.categories_tags) ? p.categories_tags : undefined,
                    ...parseNutriments(p.nutriments ?? {}),
                }));
            };
            const dutchParams = new URLSearchParams({
                search_terms: query,
                json: '1',
                page_size: '25',
                lc: 'nl',
                sort_by: 'unique_scans_n',
                tagtype_0: 'countries',
                tag_contains_0: 'contains',
                tag_0: 'netherlands',
            });
            const globalParams = new URLSearchParams({
                search_terms: query,
                json: '1',
                page_size: '50',
                sort_by: 'unique_scans_n',
            });
            // Try NL-focused search first, then broaden globally when no results are found.
            const products = await fetchProducts(dutchParams);
            const fallbackProducts = products.length > 0 ? products : await fetchProducts(globalParams);
            // Re-rank by query relevance: score by how many query words appear in product_name
            return this.rankByRelevance(fallbackProducts, query).slice(0, 10);
        }
        catch {
            return [];
        }
    }
    /** Score products by how many query words appear in their name, sort descending */
    static rankByRelevance(products, query) {
        const words = query.toLowerCase().split(/\s+/).filter(w => w.length > 1);
        if (words.length === 0)
            return products;
        return products
            .map(p => {
            const name = (p.product_name + ' ' + (p.brands ?? '')).toLowerCase();
            const matches = words.filter(w => name.includes(w)).length;
            return { product: p, score: matches };
        })
            .sort((a, b) => b.score - a.score)
            .filter(r => r.score > 0)
            .map(r => r.product);
    }
    /**
     * Calculate nutrition values for a given serving size in grams.
     * Formula: (nutrient per 100g × grams) / 100
     * Sodium is converted from g to mg in the output.
     */
    static calculateServing(product, grams) {
        const scale = (val) => Math.round((val * grams / 100) * 100) / 100;
        return {
            calories: scale(product.calories_per_100g),
            protein_g: scale(product.protein_per_100g),
            carbs_g: scale(product.carbs_per_100g),
            fat_g: scale(product.fat_per_100g),
            fiber_g: scale(product.fiber_per_100g),
            sugar_g: scale(product.sugar_per_100g),
            sodium_mg: scale(product.sodium_per_100g * 1000),
        };
    }
    /**
     * Determine a sensible default serving size (in grams) for a product.
     * Priority:
     * 1. Drinks (beverages category): full container (product_quantity)
     * 2. serving_quantity if available (numeric serving grams from OFF)
     * 3. Parse serving_size string for a numeric value
     * 4. Fallback: 100g
     */
    static getDefaultServing(product) {
        const isBeverage = product.categories_tags?.some(t => t.includes('beverage') || t.includes('drink') || t.includes('juice') || t.includes('milk') || t.includes('water'));
        // For beverages, prefer full container size
        if (isBeverage && product.product_quantity && product.product_quantity > 0) {
            return Math.round(product.product_quantity);
        }
        // Use serving_quantity if available (this is the per-serving weight from OFF)
        if (product.serving_quantity && product.serving_quantity > 0) {
            return Math.round(product.serving_quantity);
        }
        // Try to parse serving_size string, e.g. "30g", "1 bar (45g)", "250ml"
        if (product.serving_size) {
            const parsed = this.parseServingSize(product.serving_size);
            if (parsed > 0)
                return Math.round(parsed);
        }
        // For non-beverage products with a small package, use full package
        if (product.product_quantity && product.product_quantity > 0 && product.product_quantity <= 100) {
            return Math.round(product.product_quantity);
        }
        return 100;
    }
    /** Parse a serving_size string like "30g", "1 bar (45g)", "250 ml" into grams */
    static parseServingSize(serving) {
        // Try parenthesized value first: "1 bar (45g)" → 45
        const parenMatch = serving.match(/\((\d+(?:\.\d+)?)\s*(?:g|ml)\)/i);
        if (parenMatch)
            return parseFloat(parenMatch[1]);
        // Try plain value: "30g", "250 ml", "100g"
        const plainMatch = serving.match(/(\d+(?:\.\d+)?)\s*(?:g|ml)\b/i);
        if (plainMatch)
            return parseFloat(plainMatch[1]);
        // Try just a number
        const numMatch = serving.match(/(\d+(?:\.\d+)?)/);
        if (numMatch)
            return parseFloat(numMatch[1]);
        return 0;
    }
    /**
     * Get a sensible step increment for adjusting serving size.
     * Adapts to the current serving weight.
     */
    static getServingStep(currentGrams) {
        if (currentGrams <= 50)
            return 5;
        if (currentGrams <= 200)
            return 25;
        if (currentGrams <= 500)
            return 50;
        return 100;
    }
    /**
     * Get quick-select portion presets based on the default serving size.
     * Returns array of { label, grams } objects.
     */
    static getPortionPresets(defaultGrams) {
        return [
            { label: '½', grams: Math.round(defaultGrams * 0.5) },
            { label: '1', grams: defaultGrams },
            { label: '1½', grams: Math.round(defaultGrams * 1.5) },
            { label: '2', grams: defaultGrams * 2 },
        ];
    }
}
