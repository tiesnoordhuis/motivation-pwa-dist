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
