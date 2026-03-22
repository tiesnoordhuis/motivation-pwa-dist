import { test, mock } from 'node:test';
import assert from 'node:assert';
function flush() {
    return Promise.resolve().then(() => undefined);
}
test('ProjectsDashboardScreen renders mobile overview cards and navigates to dedicated views', async () => {
    const { ProjectsDashboardScreen } = await import('./projects-dashboard-screen.component.js');
    const { ProjectsService } = await import('../../services/projects.service.js');
    const summary = {
        project: { id: 'motivation', name: 'Motivation' },
        sprintName: 'Sprint 5',
        sprintGoal: 'Project section MVP',
        activeSprintCount: 1,
        topStory: {
            id: '047',
            title: 'Projects — Motivation Dashboard',
            status: 'in_progress',
        },
        latestCommit: {
            shortHash: '1234567',
            subject: 'feat: initial projects dashboard',
        },
    };
    mock.method(ProjectsService, 'fetchMotivationSummary', async () => summary);
    try {
        const screen = new ProjectsDashboardScreen();
        document.body.appendChild(screen);
        await flush();
        await flush();
        const dashboardEl = screen.querySelector('project-dashboard');
        assert.ok(dashboardEl);
        const shadow = dashboardEl.shadowRoot;
        assert.match(shadow.getElementById('project-name').textContent ?? '', /Motivation/);
        assert.strictEqual(shadow.querySelectorAll('.nav-card').length, 3);
        assert.ok(shadow.getElementById('project-help-popover'));
        assert.match(shadow.getElementById('scrumboard-preview').textContent ?? '', /1 item in the active sprint/i);
        shadow.getElementById('stories-link').click();
        assert.strictEqual(window.location.hash, '#/projects/stories');
    }
    finally {
        mock.restoreAll();
        document.body.replaceChildren();
        window.location.hash = '';
    }
});
