import { test, mock } from 'node:test';
import assert from 'node:assert';
function flush() {
    return Promise.resolve().then(() => undefined);
}
test('HealthDashboardScreen renders fetched dashboard data', async () => {
    const { HealthDashboardScreen } = await import('./health-dashboard-screen.component.js');
    const { HealthService } = await import('../../services/health.service.js');
    const activities = [{
            id: 'a1',
            type: 'running',
            source: 'manual',
            title: 'Morning run',
            date: '2026-03-21',
            created_at: '2026-03-21T08:00:00Z',
            updated_at: '2026-03-21T08:00:00Z',
        }];
    const summaries = [{
            date: '2026-03-21',
            total_calories: 2200,
            total_protein_g: 130,
            total_carbs_g: 210,
            total_fat_g: 70,
            entry_count: 3,
        }];
    const nutrition = [{
            id: 1,
            date: '2026-03-21',
            meal_type: 'Breakfast',
            food_name: 'Oats',
            calories: 500,
            source: 'manual',
            created_at: '2026-03-21T08:30:00Z',
        }];
    mock.method(HealthService, 'fetchDashboardActivities', async () => activities);
    mock.method(HealthService, 'fetchNutritionSummary', async () => summaries);
    mock.method(HealthService, 'fetchNutritionByDateRange', async () => nutrition);
    const originalNow = Temporal.Now.plainDateISO;
    Temporal.Now.plainDateISO = () => Temporal.PlainDate.from('2026-03-21');
    try {
        const screen = new HealthDashboardScreen();
        document.body.appendChild(screen);
        await flush();
        await flush();
        const dashboard = screen.querySelector('health-dashboard');
        assert.ok(dashboard);
        const dashboardShadow = dashboard.shadowRoot;
        assert.strictEqual(dashboardShadow.getElementById('loading').hidden, true);
        assert.strictEqual(dashboardShadow.getElementById('content').hidden, false);
        assert.strictEqual(dashboardShadow.getElementById('error').hidden, true);
        const timeline = dashboardShadow.getElementById('health-timeline');
        const timelineShadow = timeline.shadowRoot;
        assert.match(timelineShadow.getElementById('streak-stat').textContent ?? '', /1-day streak/);
        assert.match(timelineShadow.getElementById('avg-cal-stat').textContent ?? '', /2200 kcal avg/);
        assert.ok(timelineShadow.getElementById('timeline-list').children.length >= 1);
        const chart = dashboardShadow.getElementById('calorie-trend-chart');
        const chartShadow = chart.shadowRoot;
        assert.strictEqual(chartShadow.getElementById('trend-chart').hidden, false);
        assert.strictEqual(chartShadow.getElementById('trend-bars').children.length, 7);
    }
    finally {
        Temporal.Now.plainDateISO = originalNow;
        mock.restoreAll();
        document.body.replaceChildren();
    }
});
test('HealthDashboardScreen shows an error when dashboard loading fails', async () => {
    const { HealthDashboardScreen } = await import('./health-dashboard-screen.component.js');
    const { HealthService } = await import('../../services/health.service.js');
    mock.method(console, 'error', () => { });
    mock.method(HealthService, 'fetchDashboardActivities', async () => {
        throw new Error('boom');
    });
    mock.method(HealthService, 'fetchNutritionSummary', async () => []);
    mock.method(HealthService, 'fetchNutritionByDateRange', async () => []);
    try {
        const screen = new HealthDashboardScreen();
        document.body.appendChild(screen);
        await flush();
        await flush();
        const dashboard = screen.querySelector('health-dashboard');
        assert.ok(dashboard);
        const errorEl = dashboard.shadowRoot.getElementById('error');
        assert.strictEqual(errorEl.hidden, false);
        assert.match(errorEl.textContent ?? '', /Failed to load health data/);
    }
    finally {
        mock.restoreAll();
        document.body.replaceChildren();
    }
});
