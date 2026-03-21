import { test, mock } from 'node:test';
import assert from 'node:assert';
test('HealthDayScreen loads date-scoped data', async () => {
    const { HealthDayScreen } = await import('./health-day-screen.component.js');
    const { HealthService } = await import('../../services/health.service.js');
    const mockActivities = [{
            id: 'a1',
            type: 'running',
            source: 'manual',
            title: 'Morning run',
            date: '2025-01-15',
            created_at: '2025-01-15T08:00:00Z',
            updated_at: '2025-01-15T08:00:00Z',
        }];
    const mockNutrition = [{
            id: 1,
            date: '2025-01-15',
            meal_type: 'Breakfast',
            food_name: 'Oats',
            calories: 300,
            source: 'manual',
            created_at: '2025-01-15T08:30:00Z',
        }];
    const activityMock = mock.method(HealthService, 'fetchActivitiesByDate', async () => mockActivities);
    const nutritionMock = mock.method(HealthService, 'fetchNutritionByDate', async () => mockNutrition);
    try {
        const screen = new HealthDayScreen();
        screen.date = '2025-01-15';
        document.body.appendChild(screen);
        await Promise.resolve();
        await Promise.resolve();
        assert.strictEqual(activityMock.mock.calls.length, 1);
        assert.strictEqual(activityMock.mock.calls[0].arguments[0], '2025-01-15');
        assert.strictEqual(nutritionMock.mock.calls.length, 1);
        assert.strictEqual(nutritionMock.mock.calls[0].arguments[0], '2025-01-15');
    }
    finally {
        mock.restoreAll();
        document.body.replaceChildren();
    }
});
test('HealthDayScreen renders fetched day data into the detail component', async () => {
    const { HealthDayScreen } = await import('./health-day-screen.component.js');
    const { HealthService } = await import('../../services/health.service.js');
    const mockActivities = [{
            id: 'a1',
            type: 'running',
            source: 'manual',
            title: 'Morning run',
            date: '2025-01-15',
            created_at: '2025-01-15T08:00:00Z',
            updated_at: '2025-01-15T08:00:00Z',
        }];
    const mockNutrition = [{
            id: 1,
            date: '2025-01-15',
            meal_type: 'Breakfast',
            food_name: 'Oats',
            calories: 300,
            source: 'manual',
            created_at: '2025-01-15T08:30:00Z',
        }];
    mock.method(HealthService, 'fetchActivitiesByDate', async () => mockActivities);
    mock.method(HealthService, 'fetchNutritionByDate', async () => mockNutrition);
    try {
        const screen = new HealthDayScreen();
        screen.date = '2025-01-15';
        document.body.appendChild(screen);
        await Promise.resolve();
        await Promise.resolve();
        const detail = screen.querySelector('health-day-detail');
        assert.ok(detail);
        const shadow = detail.shadowRoot;
        assert.strictEqual(shadow.getElementById('loading').hidden, true);
        assert.strictEqual(shadow.getElementById('content').hidden, false);
        assert.match(shadow.getElementById('day-title').textContent ?? '', /2025-01-15/);
        const foodItem = shadow.querySelector('.food-item');
        assert.ok(foodItem);
        assert.match(foodItem.textContent ?? '', /Oats/);
        const activityCard = shadow.querySelector('activity-detail-card');
        assert.ok(activityCard);
    }
    finally {
        mock.restoreAll();
        document.body.replaceChildren();
    }
});
test('HealthDayScreen ignores stale responses when the route date changes quickly', async () => {
    const { HealthDayScreen } = await import('./health-day-screen.component.js');
    const { HealthService } = await import('../../services/health.service.js');
    let resolveActivitiesFirst;
    let resolveNutritionFirst;
    const firstActivities = new Promise((resolve) => { resolveActivitiesFirst = resolve; });
    const firstNutrition = new Promise((resolve) => { resolveNutritionFirst = resolve; });
    mock.method(HealthService, 'fetchActivitiesByDate', async (date) => {
        if (date === '2025-01-15')
            return firstActivities;
        return [{
                id: 'a2',
                type: 'walking',
                source: 'manual',
                title: 'Evening walk',
                date,
                created_at: `${date}T18:00:00Z`,
                updated_at: `${date}T18:00:00Z`,
            }];
    });
    mock.method(HealthService, 'fetchNutritionByDate', async (date) => {
        if (date === '2025-01-15')
            return firstNutrition;
        return [{
                id: 2,
                date,
                meal_type: 'Dinner',
                food_name: 'Soup',
                calories: 400,
                source: 'manual',
                created_at: `${date}T19:00:00Z`,
            }];
    });
    try {
        const screen = new HealthDayScreen();
        screen.date = '2025-01-15';
        document.body.appendChild(screen);
        await Promise.resolve();
        screen.date = '2025-01-16';
        screen.connectedCallback();
        await Promise.resolve();
        await Promise.resolve();
        resolveActivitiesFirst([{
                id: 'a1',
                type: 'running',
                source: 'manual',
                title: 'Morning run',
                date: '2025-01-15',
                created_at: '2025-01-15T08:00:00Z',
                updated_at: '2025-01-15T08:00:00Z',
            }]);
        resolveNutritionFirst([{
                id: 1,
                date: '2025-01-15',
                meal_type: 'Breakfast',
                food_name: 'Oats',
                calories: 300,
                source: 'manual',
                created_at: '2025-01-15T08:30:00Z',
            }]);
        await Promise.resolve();
        await Promise.resolve();
        const detail = screen.querySelector('health-day-detail');
        const shadow = detail.shadowRoot;
        assert.match(shadow.getElementById('day-title').textContent ?? '', /2025-01-16/);
        assert.match(shadow.textContent ?? '', /Soup/);
        assert.doesNotMatch(shadow.textContent ?? '', /Oats/);
    }
    finally {
        mock.restoreAll();
        document.body.replaceChildren();
    }
});
