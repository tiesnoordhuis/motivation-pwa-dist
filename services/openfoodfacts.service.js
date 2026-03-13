const OFF_API_BASE = 'https://world.openfoodfacts.org';
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
            const response = await fetch(`${OFF_API_BASE}/api/v2/product/${barcode}.json`);
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
                ...parseNutriments(p.nutriments ?? {}),
            };
        }
        catch {
            return null;
        }
    }
    static async searchFood(query) {
        try {
            const params = new URLSearchParams({
                search_terms: query,
                json: '1',
                page_size: '10',
            });
            const response = await fetch(`${OFF_API_BASE}/cgi/search.pl?${params}`);
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
                ...parseNutriments(p.nutriments ?? {}),
            }));
        }
        catch {
            return [];
        }
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
}
