import { test } from 'node:test';
import assert from 'node:assert';
import Module from 'node:module';
// Mock CSS imports for testing
const originalRequire = Module.prototype.require;
Module.prototype.require = function (id) {
    if (id.endsWith('.css'))
        return '';
    return originalRequire.apply(this, [id]);
};
// Also polyfill global CSS token for JSDOM in TS context if needed later
if (typeof globalThis.CSSStyleSheet === 'undefined') {
    globalThis.CSSStyleSheet = class CSSStyleSheet {
        replaceSync() { }
    };
}
const { mergeTimelineData } = await import('./health-timeline.component.js');
test('mergeTimelineData merges activities and nutrition correctly', () => {
    const activities = [
        { id: '1', type: 'running', title: 'Morning Run', date: '2026-03-14T08:00:00Z', created_at: '2026-03-14T08:00:00Z', updated_at: '2026-03-14T08:00:00Z', source: 'manual' },
        { id: '2', type: 'gym', title: 'Weightlifting', date: '2026-03-13T18:00:00Z', created_at: '2026-03-13T18:00:00Z', updated_at: '2026-03-13T18:00:00Z', source: 'manual' },
        { id: '3', type: 'walking', title: 'Evening Walk', date: '2026-03-14T19:00:00Z', created_at: '2026-03-14T19:00:00Z', updated_at: '2026-03-14T19:00:00Z', source: 'manual' }
    ];
    const nutrition = [
        { id: 1, date: '2026-03-14', food_name: 'Apple', calories: 95, protein_g: 0.5, carbs_g: 25, fat_g: 0.3, meal_type: 'Snacks', created_at: '2026-03-14T12:00:00Z', source: 'manual' },
        { id: 2, date: '2026-03-14', food_name: 'Chicken Rice', calories: 500, protein_g: 40, carbs_g: 60, fat_g: 10, meal_type: 'Dinner', created_at: '2026-03-14T19:00:00Z', source: 'openfoodfacts' },
        { id: 3, date: '2026-03-12', food_name: 'Salad', calories: 200, protein_g: 5, carbs_g: 20, fat_g: 15, meal_type: 'Lunch', created_at: '2026-03-12T13:00:00Z', source: 'ai_estimate' }
    ];
    const merged = mergeTimelineData(activities, nutrition);
    assert.strictEqual(merged.size, 3, 'Should have entries for 3 distinct dates');
    const day14 = merged.get('2026-03-14');
    assert.strictEqual(day14.activities.length, 2, 'Should have 2 activities on 14th');
    assert.strictEqual(day14.nutrition.length, 2, 'Should have 2 nutrition entries on 14th');
    const day13 = merged.get('2026-03-13');
    assert.strictEqual(day13.activities.length, 1, 'Should have 1 activity on 13th');
    assert.strictEqual(day13.nutrition.length, 0, 'Should have no nutrition on 13th');
    const day12 = merged.get('2026-03-12');
    assert.strictEqual(day12.activities.length, 0, 'Should have no activity on 12th');
    assert.strictEqual(day12.nutrition.length, 1, 'Should have 1 nutrition entry on 12th');
});
