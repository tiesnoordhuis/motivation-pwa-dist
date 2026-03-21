import { test, mock, before } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
test('OpenFoodFactsService', async (t) => {
    const dom = new JSDOM('<!DOCTYPE html>', { url: 'http://localhost:8080' });
    global.window = dom.window;
    global.document = dom.window.document;
    const { OpenFoodFactsService } = await import('./openfoodfacts.service.js');
    await t.test('lookupBarcode returns parsed product on success', async () => {
        const apiResponse = {
            status: 1,
            product: {
                product_name: 'Chocomel',
                brands: 'Chocomel',
                image_front_url: 'https://images.off.org/chocomel.jpg',
                nutriments: {
                    'energy-kcal_100g': 82,
                    'proteins_100g': 3.1,
                    'carbohydrates_100g': 11,
                    'fat_100g': 2.7,
                    'fiber_100g': 0.8,
                    'sugars_100g': 10.5,
                    'sodium_100g': 0.05,
                },
            },
        };
        global.fetch = mock.fn(async () => ({
            ok: true,
            json: async () => apiResponse,
        }));
        const result = await OpenFoodFactsService.lookupBarcode('8710400500247');
        assert.ok(result);
        assert.strictEqual(result.product_name, 'Chocomel');
        assert.strictEqual(result.brands, 'Chocomel');
        assert.strictEqual(result.image_url, 'https://images.off.org/chocomel.jpg');
        assert.strictEqual(result.calories_per_100g, 82);
        assert.strictEqual(result.protein_per_100g, 3.1);
        assert.strictEqual(result.carbs_per_100g, 11);
        assert.strictEqual(result.fat_per_100g, 2.7);
        assert.strictEqual(result.fiber_per_100g, 0.8);
        assert.strictEqual(result.sugar_per_100g, 10.5);
        assert.strictEqual(result.sodium_per_100g, 0.05);
        const fetchMock = global.fetch;
        const url = fetchMock.mock.calls[0].arguments[0];
        assert.ok(url.includes('/api/sections/health/openfoodfacts/product/8710400500247'));
    });
    await t.test('lookupBarcode returns null when product not found', async () => {
        global.fetch = mock.fn(async () => ({
            ok: true,
            json: async () => ({ status: 0 }),
        }));
        const result = await OpenFoodFactsService.lookupBarcode('0000000000000');
        assert.strictEqual(result, null);
    });
    await t.test('lookupBarcode returns null on network error', async () => {
        global.fetch = mock.fn(async () => ({
            ok: false,
            statusText: 'Service Unavailable',
        }));
        const result = await OpenFoodFactsService.lookupBarcode('1234567890');
        assert.strictEqual(result, null);
    });
    await t.test('lookupBarcode handles missing nutriments gracefully', async () => {
        global.fetch = mock.fn(async () => ({
            ok: true,
            json: async () => ({
                status: 1,
                product: {
                    product_name: 'Mystery Item',
                    nutriments: {},
                },
            }),
        }));
        const result = await OpenFoodFactsService.lookupBarcode('9999999999999');
        assert.ok(result);
        assert.strictEqual(result.product_name, 'Mystery Item');
        assert.strictEqual(result.calories_per_100g, 0);
        assert.strictEqual(result.protein_per_100g, 0);
        assert.strictEqual(result.brands, undefined);
        assert.strictEqual(result.image_url, undefined);
    });
    await t.test('searchFood returns parsed product list', async () => {
        const apiResponse = {
            products: [
                {
                    product_name: 'Greek Yogurt',
                    brands: 'Fage',
                    nutriments: {
                        'energy-kcal_100g': 97,
                        'proteins_100g': 9,
                        'carbohydrates_100g': 3.6,
                        'fat_100g': 5,
                    },
                    code: '1234567890123',
                },
                {
                    product_name: 'Vanilla Yogurt',
                    brands: 'Arla',
                    nutriments: {
                        'energy-kcal_100g': 63,
                        'proteins_100g': 11,
                        'carbohydrates_100g': 4,
                        'fat_100g': 0.2,
                    },
                    code: '9876543210987',
                },
            ],
        };
        global.fetch = mock.fn(async () => ({
            ok: true,
            json: async () => apiResponse,
        }));
        const results = await OpenFoodFactsService.searchFood('yogurt');
        assert.strictEqual(results.length, 2);
        assert.strictEqual(results[0].product_name, 'Greek Yogurt');
        assert.strictEqual(results[0].brands, 'Fage');
        assert.strictEqual(results[0].calories_per_100g, 97);
        assert.strictEqual(results[0].barcode, '1234567890123');
        assert.strictEqual(results[1].product_name, 'Vanilla Yogurt');
        const fetchMock = global.fetch;
        const url = fetchMock.mock.calls[0].arguments[0];
        assert.ok(url.includes('search_terms=yogurt'));
        assert.ok(url.includes('page_size=25'));
        assert.ok(url.includes('lc=nl'));
        assert.ok(url.includes('/api/sections/health/openfoodfacts/search'));
    });
    await t.test('searchFood returns empty array on error', async () => {
        global.fetch = mock.fn(async () => ({
            ok: false,
            statusText: 'Internal Server Error',
        }));
        const results = await OpenFoodFactsService.searchFood('nonexistent');
        assert.deepStrictEqual(results, []);
    });
    await t.test('searchFood returns empty array when aborted', async () => {
        global.fetch = mock.fn(async () => {
            const error = new Error('Aborted');
            error.name = 'AbortError';
            throw error;
        });
        const controller = new AbortController();
        controller.abort();
        const results = await OpenFoodFactsService.searchFood('banana', { signal: controller.signal });
        assert.deepStrictEqual(results, []);
    });
    await t.test('searchFood returns empty array when no products', async () => {
        global.fetch = mock.fn(async () => ({
            ok: true,
            json: async () => ({ products: [] }),
        }));
        const results = await OpenFoodFactsService.searchFood('zzzzzzzzz');
        assert.deepStrictEqual(results, []);
    });
    await t.test('calculateServing scales nutrients correctly', () => {
        const product = {
            product_name: 'Rice',
            calories_per_100g: 130,
            protein_per_100g: 2.7,
            carbs_per_100g: 28,
            fat_per_100g: 0.3,
            fiber_per_100g: 0.4,
            sugar_per_100g: 0,
            sodium_per_100g: 0.001,
        };
        const serving = OpenFoodFactsService.calculateServing(product, 250);
        assert.strictEqual(serving.calories, 325);
        assert.strictEqual(serving.protein_g, 6.75);
        assert.strictEqual(serving.carbs_g, 70);
        assert.strictEqual(serving.fat_g, 0.75);
        assert.strictEqual(serving.fiber_g, 1);
        assert.strictEqual(serving.sugar_g, 0);
        assert.strictEqual(serving.sodium_mg, 2.5);
    });
    await t.test('calculateServing handles 100g correctly', () => {
        const product = {
            product_name: 'Oats',
            calories_per_100g: 379,
            protein_per_100g: 13.2,
            carbs_per_100g: 67.7,
            fat_per_100g: 6.5,
            fiber_per_100g: 10.1,
            sugar_per_100g: 1.0,
            sodium_per_100g: 0.006,
        };
        const serving = OpenFoodFactsService.calculateServing(product, 100);
        assert.strictEqual(serving.calories, 379);
        assert.strictEqual(serving.protein_g, 13.2);
    });
    await t.test('getDefaultServing returns serving_quantity when available', () => {
        const product = {
            product_name: 'Granola Bar',
            calories_per_100g: 450,
            protein_per_100g: 7,
            carbs_per_100g: 60,
            fat_per_100g: 20,
            fiber_per_100g: 3,
            sugar_per_100g: 25,
            sodium_per_100g: 0.2,
            serving_quantity: 35,
        };
        assert.strictEqual(OpenFoodFactsService.getDefaultServing(product), 35);
    });
    await t.test('getDefaultServing uses product_quantity for beverages', () => {
        const product = {
            product_name: 'Orange Juice',
            calories_per_100g: 45,
            protein_per_100g: 0.7,
            carbs_per_100g: 10,
            fat_per_100g: 0.1,
            fiber_per_100g: 0.2,
            sugar_per_100g: 9,
            sodium_per_100g: 0.01,
            product_quantity: 330,
            categories_tags: ['en:beverages', 'en:fruit-juices'],
        };
        assert.strictEqual(OpenFoodFactsService.getDefaultServing(product), 330);
    });
    await t.test('getDefaultServing parses serving_size string', () => {
        const product = {
            product_name: 'Cereal',
            calories_per_100g: 380,
            protein_per_100g: 8,
            carbs_per_100g: 70,
            fat_per_100g: 5,
            fiber_per_100g: 7,
            sugar_per_100g: 18,
            sodium_per_100g: 0.5,
            serving_size: '1 bowl (40g)',
        };
        assert.strictEqual(OpenFoodFactsService.getDefaultServing(product), 40);
    });
    await t.test('getDefaultServing falls back to 100g', () => {
        const product = {
            product_name: 'Mystery Food',
            calories_per_100g: 200,
            protein_per_100g: 5,
            carbs_per_100g: 30,
            fat_per_100g: 8,
            fiber_per_100g: 2,
            sugar_per_100g: 10,
            sodium_per_100g: 0.3,
        };
        assert.strictEqual(OpenFoodFactsService.getDefaultServing(product), 100);
    });
    await t.test('getDefaultServing uses full package for small items', () => {
        const product = {
            product_name: 'Chocolate Bar',
            calories_per_100g: 540,
            protein_per_100g: 6,
            carbs_per_100g: 58,
            fat_per_100g: 31,
            fiber_per_100g: 2,
            sugar_per_100g: 50,
            sodium_per_100g: 0.1,
            product_quantity: 45,
        };
        assert.strictEqual(OpenFoodFactsService.getDefaultServing(product), 45);
    });
    await t.test('parseServingSize parses various formats', () => {
        assert.strictEqual(OpenFoodFactsService.parseServingSize('30g'), 30);
        assert.strictEqual(OpenFoodFactsService.parseServingSize('250 ml'), 250);
        assert.strictEqual(OpenFoodFactsService.parseServingSize('1 bar (45g)'), 45);
        assert.strictEqual(OpenFoodFactsService.parseServingSize('1 slice (28g)'), 28);
        assert.strictEqual(OpenFoodFactsService.parseServingSize(''), 0);
    });
    await t.test('getServingStep returns adaptive increments', () => {
        assert.strictEqual(OpenFoodFactsService.getServingStep(30), 5);
        assert.strictEqual(OpenFoodFactsService.getServingStep(50), 5);
        assert.strictEqual(OpenFoodFactsService.getServingStep(100), 25);
        assert.strictEqual(OpenFoodFactsService.getServingStep(200), 25);
        assert.strictEqual(OpenFoodFactsService.getServingStep(300), 50);
        assert.strictEqual(OpenFoodFactsService.getServingStep(500), 50);
        assert.strictEqual(OpenFoodFactsService.getServingStep(600), 100);
    });
    await t.test('getPortionPresets returns correct presets', () => {
        const presets = OpenFoodFactsService.getPortionPresets(100);
        assert.strictEqual(presets.length, 4);
        assert.strictEqual(presets[0].grams, 50);
        assert.strictEqual(presets[0].label, '½');
        assert.strictEqual(presets[1].grams, 100);
        assert.strictEqual(presets[1].label, '1');
        assert.strictEqual(presets[2].grams, 150);
        assert.strictEqual(presets[2].label, '1½');
        assert.strictEqual(presets[3].grams, 200);
        assert.strictEqual(presets[3].label, '2');
    });
    await t.test('rankByRelevance prioritizes products with most query matches', () => {
        const products = [
            { product_name: 'Apple Pie', brands: 'Brand A', calories_per_100g: 200 },
            { product_name: 'Greek Yogurt', brands: 'Fage', calories_per_100g: 97 },
            { product_name: 'Apple Juice Green Apple', brands: 'Brand B', calories_per_100g: 45 },
        ];
        const ranked = OpenFoodFactsService.rankByRelevance(products, 'apple juice');
        assert.strictEqual(ranked[0].product_name, 'Apple Juice Green Apple');
        assert.strictEqual(ranked.length, 2); // Greek Yogurt has 0 matches, filtered out
    });
    await t.test('searchFood includes country filter and re-ranks results', async () => {
        const apiResponse = {
            products: [
                { product_name: 'Random Thing', brands: 'X', nutriments: { 'energy-kcal_100g': 100 }, code: '1' },
                { product_name: 'Chocomel Chocolate Milk', brands: 'Chocomel', nutriments: { 'energy-kcal_100g': 82 }, code: '2' },
            ],
        };
        global.fetch = mock.fn(async () => ({
            ok: true,
            json: async () => apiResponse,
        }));
        const results = await OpenFoodFactsService.searchFood('chocomel');
        // Should be re-ranked: Chocomel first (name matches), Random Thing filtered out
        assert.strictEqual(results.length, 1);
        assert.strictEqual(results[0].product_name, 'Chocomel Chocolate Milk');
        // Verify search URL includes country filter
        const fetchMock = global.fetch;
        const url = fetchMock.mock.calls[0].arguments[0];
        assert.ok(url.includes('page_size=25'));
        assert.ok(url.includes('lc=nl'));
        assert.ok(url.includes('tag_0=netherlands'));
        assert.ok(url.includes('sort_by=unique_scans_n'));
        assert.ok(url.includes('/api/sections/health/openfoodfacts/search'));
    });
});
