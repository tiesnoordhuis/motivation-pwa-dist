import { test } from 'node:test';
import assert from 'node:assert';
import { HealthDayDetail } from './health-day-detail.component.js';
test('HealthDayDetail Component', async (t) => {
    await t.test('renders date context', () => {
        const el = new HealthDayDetail();
        document.body.appendChild(el);
        el.dateContext = '2026-03-14';
        const title = el.shadowRoot.getElementById('day-title');
        assert.strictEqual(title.textContent, '2026-03-14');
        el.remove();
    });
    await t.test('renders summary data correctly', () => {
        const el = new HealthDayDetail();
        const summary = {
            date: '2026-03-14', total_calories: 2150,
            total_protein_g: 150.5, total_carbs_g: 200, total_fat_g: 60,
            entry_count: 3
        };
        el.summary = summary;
        const cal = el.shadowRoot.getElementById('total-cal');
        const p = el.shadowRoot.getElementById('total-p');
        const c = el.shadowRoot.getElementById('total-c');
        const f = el.shadowRoot.getElementById('total-f');
        assert.strictEqual(cal.textContent, '2150');
        assert.strictEqual(p.textContent, '151');
        assert.strictEqual(c.textContent, '200');
        assert.strictEqual(f.textContent, '60');
    });
    await t.test('renders food entries by meal type', () => {
        const el = new HealthDayDetail();
        const nutrition = [
            { id: 1, date: '2026-03-14', product_name: 'Eggs', calories: 200, meal_type: 'Breakfast' },
            { id: 2, date: '2026-03-14', product_name: 'Toast', calories: 150, meal_type: 'Breakfast' },
            { id: 3, date: '2026-03-14', product_name: 'Salad', calories: 300, meal_type: 'Lunch' },
        ];
        el.nutrition = nutrition;
        const breakfastList = el.shadowRoot.getElementById('breakfast-list');
        const lunchList = el.shadowRoot.getElementById('lunch-list');
        const dinnerList = el.shadowRoot.getElementById('dinner-list');
        const bItems = breakfastList.querySelectorAll('.food-item');
        assert.strictEqual(bItems.length, 2);
        const lItems = lunchList.querySelectorAll('.food-item');
        assert.strictEqual(lItems.length, 1);
        const emptyDinner = dinnerList.querySelector('.empty-state');
        assert.ok(emptyDinner !== null, 'Dinner should show empty state');
    });
    await t.test('fires add workout event', () => {
        const el = new HealthDayDetail();
        el.dateContext = '2026-03-14';
        let payload = null;
        el.addEventListener('health:add-workout', (event) => {
            payload = event.detail;
        });
        const btn = el.shadowRoot.getElementById('add-workout-btn');
        btn.click();
        assert.deepStrictEqual(payload, { date: '2026-03-14' });
    });
    await t.test('fires add food event with meal type', () => {
        const el = new HealthDayDetail();
        el.dateContext = '2026-03-14';
        let payload = null;
        el.addEventListener('health:add-food', (event) => {
            payload = event.detail;
        });
        const lunchBtn = el.shadowRoot.querySelector('button[data-meal="Lunch"]');
        lunchBtn.click();
        assert.deepStrictEqual(payload, { date: '2026-03-14', meal: 'Lunch' });
    });
    await t.test('fires edit food event when food item is clicked', () => {
        const el = new HealthDayDetail();
        const testEntry = {
            id: 42,
            date: '2026-03-14',
            meal_type: 'Lunch',
            food_name: 'Salad',
            calories: 300,
            source: 'manual',
            created_at: '2026-03-14T12:00:00Z',
        };
        el.nutrition = [testEntry];
        let payload = null;
        el.addEventListener('health:edit-food', (event) => {
            payload = event.detail.entry;
        });
        const foodItem = el.shadowRoot.querySelector('.food-item');
        assert.ok(foodItem, 'Food item should exist');
        foodItem.click();
        assert.notStrictEqual(payload, null);
        const loggedEntry = payload;
        assert.strictEqual(loggedEntry.id, 42);
        assert.strictEqual(loggedEntry.food_name, 'Salad');
    });
    await t.test('fires edit workout event when manual activity card is clicked', () => {
        const el = new HealthDayDetail();
        const testActivity = {
            id: 'act-1',
            type: 'running',
            source: 'manual',
            title: 'Morning run',
            date: '2026-03-14',
            created_at: '2026-03-14T08:00:00Z',
            updated_at: '2026-03-14T08:00:00Z',
        };
        el.activities = [testActivity];
        let payload = null;
        el.addEventListener('health:edit-workout', (event) => {
            payload = event.detail.activity;
        });
        const card = el.shadowRoot.querySelector('activity-detail-card');
        assert.ok(card, 'Activity card should exist');
        card.click();
        assert.notStrictEqual(payload, null);
        const loggedActivity = payload;
        assert.strictEqual(loggedActivity.id, 'act-1');
        assert.strictEqual(loggedActivity.title, 'Morning run');
    });
});
