import { test, mock } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
test('HealthService nutrition methods', async (t) => {
    const dom = new JSDOM('<!DOCTYPE html>', { url: 'http://localhost:8080' });
    global.window = dom.window;
    global.document = dom.window.document;
    const { HealthService } = await import('./health.service.js');
    await t.test('fetchNutritionByDate calls correct URL and returns data', async () => {
        const mockEntries = [
            {
                id: 1, date: '2025-01-15', meal_type: 'Breakfast', food_name: 'Oats',
                calories: 379, protein_g: 13, carbs_g: 68, fat_g: 7,
                source: 'manual', created_at: '2025-01-15T08:00:00Z',
            },
        ];
        global.fetch = mock.fn(async () => ({
            ok: true,
            json: async () => mockEntries,
        }));
        const result = await HealthService.fetchNutritionByDate('2025-01-15');
        assert.deepStrictEqual(result, mockEntries);
        const url = global.fetch.mock.calls[0].arguments[0];
        assert.strictEqual(url, 'http://localhost:3000/api/sections/health/nutrition?date=2025-01-15');
    });
    await t.test('fetchNutritionByDate throws on error', async () => {
        global.fetch = mock.fn(async () => ({
            ok: false, statusText: 'Bad Request',
        }));
        await assert.rejects(() => HealthService.fetchNutritionByDate('bad'), /Failed to fetch nutrition/);
    });
    await t.test('fetchNutritionSummary calls correct URL with date range', async () => {
        const mockSummary = [
            { date: '2025-01-15', total_calories: 2000, total_protein_g: 80, total_carbs_g: 250, total_fat_g: 70, entry_count: 4 },
        ];
        global.fetch = mock.fn(async () => ({
            ok: true,
            json: async () => mockSummary,
        }));
        const result = await HealthService.fetchNutritionSummary('2025-01-10', '2025-01-16');
        assert.deepStrictEqual(result, mockSummary);
        const url = global.fetch.mock.calls[0].arguments[0];
        assert.strictEqual(url, 'http://localhost:3000/api/sections/health/nutrition/summary?from=2025-01-10&to=2025-01-16');
    });
    await t.test('createNutritionEntry sends POST with correct body', async () => {
        const newEntry = {
            date: '2025-01-15', meal_type: 'Lunch', food_name: 'Chocomel',
            calories: 82, protein_g: 3, carbs_g: 11, fat_g: 3,
            source: 'openfoodfacts', source_ref: '8710400500247',
        };
        const mockResponse = { id: 5, ...newEntry, created_at: '2025-01-15T12:00:00Z' };
        global.fetch = mock.fn(async () => ({
            ok: true,
            json: async () => mockResponse,
        }));
        const result = await HealthService.createNutritionEntry(newEntry);
        assert.strictEqual(result.id, 5);
        const fetchMock = global.fetch;
        const [url, opts] = fetchMock.mock.calls[0].arguments;
        assert.strictEqual(url, 'http://localhost:3000/api/sections/health/nutrition');
        assert.strictEqual(opts.method, 'POST');
        assert.deepStrictEqual(JSON.parse(opts.body), newEntry);
    });
    await t.test('createNutritionEntry throws on error', async () => {
        global.fetch = mock.fn(async () => ({
            ok: false, statusText: 'Validation Error',
        }));
        await assert.rejects(() => HealthService.createNutritionEntry({
            date: '2025-01-15', meal_type: 'Lunch', food_name: 'test',
            source: 'manual',
        }), /Failed to create nutrition entry/);
    });
    await t.test('deleteNutritionEntry sends DELETE request', async () => {
        global.fetch = mock.fn(async () => ({ ok: true }));
        await HealthService.deleteNutritionEntry(42);
        const fetchMock = global.fetch;
        const [url, opts] = fetchMock.mock.calls[0].arguments;
        assert.strictEqual(url, 'http://localhost:3000/api/sections/health/nutrition/42');
        assert.strictEqual(opts.method, 'DELETE');
    });
    await t.test('deleteNutritionEntry throws on error', async () => {
        global.fetch = mock.fn(async () => ({
            ok: false, statusText: 'Not Found',
        }));
        await assert.rejects(() => HealthService.deleteNutritionEntry(999), /Failed to delete nutrition entry/);
    });
});
