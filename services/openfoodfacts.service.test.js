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
        assert.strictEqual(url, 'https://world.openfoodfacts.org/api/v2/product/8710400500247.json');
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
                    product_name: 'Skyr',
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
        assert.strictEqual(results[1].product_name, 'Skyr');
        const fetchMock = global.fetch;
        const url = fetchMock.mock.calls[0].arguments[0];
        assert.ok(url.includes('search_terms=yogurt'));
        assert.ok(url.includes('page_size=10'));
    });
    await t.test('searchFood returns empty array on error', async () => {
        global.fetch = mock.fn(async () => ({
            ok: false,
            statusText: 'Internal Server Error',
        }));
        const results = await OpenFoodFactsService.searchFood('nonexistent');
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
});
