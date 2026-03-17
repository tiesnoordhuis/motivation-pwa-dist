import { test } from 'node:test';
import assert from 'node:assert';
import { ActivityEdit } from './activity-edit.component.js';
function makeActivity(overrides = {}) {
    return {
        id: 'abc-123',
        type: 'running',
        source: 'manual',
        title: 'Morning run',
        description: '5km easy pace',
        date: '2026-03-15',
        duration_minutes: 30,
        calories_burned: 300,
        created_at: '2026-03-15T08:00:00Z',
        updated_at: '2026-03-15T08:00:00Z',
        ...overrides,
    };
}
test('ActivityEdit Component', async (t) => {
    await t.test('populates form from activity', () => {
        const el = new ActivityEdit();
        el.activity = makeActivity();
        const shadow = el.shadowRoot;
        assert.strictEqual(shadow.getElementById('title').value, 'Morning run');
        assert.strictEqual(shadow.getElementById('type').value, 'running');
        assert.strictEqual(shadow.getElementById('date').value, '2026-03-15');
        assert.strictEqual(shadow.getElementById('duration').value, '30');
        assert.strictEqual(shadow.getElementById('calories').value, '300');
        assert.strictEqual(shadow.getElementById('description').value, '5km easy pace');
    });
    await t.test('handles empty optional fields', () => {
        const el = new ActivityEdit();
        el.activity = makeActivity({ duration_minutes: undefined, calories_burned: undefined, description: undefined });
        const shadow = el.shadowRoot;
        assert.strictEqual(shadow.getElementById('duration').value, '');
        assert.strictEqual(shadow.getElementById('calories').value, '');
        assert.strictEqual(shadow.getElementById('description').value, '');
    });
    await t.test('fires save with updated values', () => {
        return new Promise((resolve) => {
            const el = new ActivityEdit();
            document.body.appendChild(el);
            el.activity = makeActivity();
            el.onSave = (id, updates) => {
                assert.strictEqual(id, 'abc-123');
                assert.strictEqual(updates.title, 'Morning run');
                assert.strictEqual(updates.type, 'running');
                assert.strictEqual(updates.date, '2026-03-15');
                assert.strictEqual(updates.duration_minutes, 30);
                el.remove();
                resolve();
            };
            el.shadowRoot.getElementById('btn-save').click();
        });
    });
    await t.test('fires delete with confirmation', () => {
        return new Promise((resolve) => {
            const el = new ActivityEdit();
            document.body.appendChild(el);
            el.activity = makeActivity();
            const origConfirm = globalThis.confirm;
            globalThis.confirm = () => true;
            el.onDelete = (id) => {
                assert.strictEqual(id, 'abc-123');
                globalThis.confirm = origConfirm;
                el.remove();
                resolve();
            };
            el.shadowRoot.getElementById('btn-delete').click();
        });
    });
    await t.test('save does nothing without title', () => {
        const el = new ActivityEdit();
        document.body.appendChild(el);
        el.activity = makeActivity();
        let called = false;
        el.onSave = () => { called = true; };
        // Clear title
        el.shadowRoot.getElementById('title').value = '';
        el.shadowRoot.getElementById('btn-save').click();
        assert.strictEqual(called, false, 'Save should not fire with empty title');
        el.remove();
    });
});
