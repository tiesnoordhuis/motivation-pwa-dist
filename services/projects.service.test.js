import { test, mock } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
test('ProjectsService fetches motivation dashboard resources', async (t) => {
    const dom = new JSDOM('<!DOCTYPE html>', { url: 'http://localhost:8080' });
    global.window = dom.window;
    global.document = dom.window.document;
    const { ProjectsService } = await import('./projects.service.js');
    await t.test('fetchMotivationSummary uses the correct endpoint', async () => {
        const payload = {
            project: { id: 'motivation', name: 'Motivation' },
            sprintName: 'Sprint 5',
            sprintGoal: 'Project section MVP',
            activeSprintCount: 1,
            topStory: { id: '047', title: 'Projects — Motivation Dashboard', status: 'in_progress' },
            latestCommit: { shortHash: '1234567', subject: 'feat: initial projects dashboard' },
        };
        global.fetch = mock.fn(async () => ({
            ok: true,
            json: async () => payload,
        }));
        const result = await ProjectsService.fetchMotivationSummary();
        assert.deepStrictEqual(result, payload);
        assert.strictEqual(global.fetch.mock.calls[0].arguments[0], 'http://localhost:3001/api/sections/projects/motivation/summary');
    });
    await t.test('fetchMotivationDashboard uses the correct endpoint', async () => {
        const payload = { project: { id: 'motivation', name: 'Motivation' }, scrumboard: { sprintName: 'Sprint 5', goal: 'Project section MVP', columns: [] } };
        global.fetch = mock.fn(async () => ({
            ok: true,
            json: async () => payload,
        }));
        const result = await ProjectsService.fetchMotivationDashboard();
        assert.deepStrictEqual(result, payload);
        assert.strictEqual(global.fetch.mock.calls[0].arguments[0], 'http://localhost:3001/api/sections/projects/motivation');
    });
    await t.test('fetchMotivationStories uses the correct endpoint', async () => {
        const payload = { project: { id: 'motivation', name: 'Motivation' }, stories: [] };
        global.fetch = mock.fn(async () => ({
            ok: true,
            json: async () => payload,
        }));
        const result = await ProjectsService.fetchMotivationStories();
        assert.deepStrictEqual(result, payload);
        assert.strictEqual(global.fetch.mock.calls[0].arguments[0], 'http://localhost:3001/api/sections/projects/motivation/stories');
    });
    await t.test('fetchMotivationGitLog throws on error', async () => {
        global.fetch = mock.fn(async () => ({
            ok: false,
            statusText: 'Forbidden',
        }));
        await assert.rejects(() => ProjectsService.fetchMotivationGitLog(), /Failed to fetch motivation git log/);
    });
});
