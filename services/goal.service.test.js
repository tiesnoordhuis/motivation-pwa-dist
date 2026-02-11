import { test, mock, before, after } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
// Setup Mocking for global fetch if it doesn't exist (Node < 18) or to spy on it
// In Node 22, fetch is global.
test('GoalService', async (t) => {
    // Setup JSDOM environment BEFORE importing the service to satisfy top-level window access
    const dom = new JSDOM('<!DOCTYPE html>', { url: 'http://localhost:8080' });
    global.window = dom.window;
    global.document = dom.window.document;
    // Use dynamic import so that the module execution sees our global window
    const { GoalService } = await import('./goal.service.js');
    await t.test('fetchGoals passes correct URL and returns data', async () => {
        const mockGoals = [{ id: '1', title: 'Test Goal', status: 'ACTIVE', description: '', created_at: '', updated_at: '' }];
        const fetchMock = mock.fn(async (..._args) => {
            return {
                ok: true,
                json: async () => mockGoals
            };
        });
        global.fetch = fetchMock;
        const goals = await GoalService.fetchGoals();
        assert.deepStrictEqual(goals, mockGoals);
        // Verify URL - since window.location is localhost, it should use localhost:3000
        const callArgs = fetchMock.mock.calls[0].arguments;
        assert.strictEqual(callArgs[0], 'http://localhost:3000/api/goals');
        // Restore? No need if we overwrite in next test or if we don't care about global state pollution in this isolated process
    });
    await t.test('fetchGoals throws on non-ok response', async () => {
        global.fetch = mock.fn(async () => {
            return {
                ok: false,
                statusText: 'Bad Request'
            };
        });
        await assert.rejects(async () => {
            await GoalService.fetchGoals();
        }, /Failed to fetch goals: Bad Request/);
    });
});
