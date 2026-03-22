import { test, mock } from 'node:test';
import assert from 'node:assert';
function flush() {
    return Promise.resolve().then(() => undefined);
}
const dashboard = {
    project: { id: 'motivation', name: 'Motivation' },
    scrumboard: {
        sprintName: 'Sprint 5',
        goal: 'Project section MVP',
        columns: [
            {
                id: 'active-sprint',
                title: 'Active Sprint',
                items: [{ id: '047', title: 'Projects - Motivation Dashboard', status: 'in_progress', points: 5 }],
            },
        ],
    },
};
const stories = {
    project: { id: 'motivation', name: 'Motivation' },
    stories: [{
            id: '047',
            title: 'Projects — Motivation Dashboard',
            story: 'As a user, I want to see the Motivation app\'s scrumboard and recent git activity in the projects section, so that I can track development progress from within the app itself.',
            priority: 'High',
            storyPoints: 5,
            status: 'in_progress',
            path: 'docs/stories/047-projects-motivation-dashboard.md',
        }],
};
const gitLog = {
    project: { id: 'motivation', name: 'Motivation' },
    commits: [{
            hash: '1234567890abcdef1234567890abcdef12345678',
            shortHash: '1234567',
            subject: 'feat: initial projects dashboard',
            authorName: 'Ties Noordhuis',
            committedAt: '2026-03-22T10:00:00+01:00',
        }],
};
test('ProjectsScrumboardScreen renders expandable scrumboard lanes', async () => {
    const { ProjectsScrumboardScreen } = await import('./projects-scrumboard-screen.component.js');
    const { ProjectsService } = await import('../../services/projects.service.js');
    mock.method(ProjectsService, 'fetchMotivationDashboard', async () => dashboard);
    try {
        const screen = new ProjectsScrumboardScreen();
        document.body.appendChild(screen);
        await flush();
        await flush();
        const component = screen.querySelector('project-scrumboard');
        assert.ok(component);
        const shadow = component.shadowRoot;
        assert.strictEqual(shadow.querySelectorAll('.board-column').length, 1);
        assert.strictEqual(shadow.querySelectorAll('.board-item').length, 1);
        assert.ok(shadow.querySelector('.board-column').open);
    }
    finally {
        mock.restoreAll();
        document.body.replaceChildren();
    }
});
test('ProjectsStoriesScreen renders expandable story cards', async () => {
    const { ProjectsStoriesScreen } = await import('./projects-stories-screen.component.js');
    const { ProjectsService } = await import('../../services/projects.service.js');
    mock.method(ProjectsService, 'fetchMotivationStories', async () => stories);
    try {
        const screen = new ProjectsStoriesScreen();
        document.body.appendChild(screen);
        await flush();
        await flush();
        const component = screen.querySelector('project-story-list');
        assert.ok(component);
        const shadow = component.shadowRoot;
        assert.strictEqual(shadow.querySelectorAll('.story-item').length, 1);
        assert.ok(shadow.querySelector('.story-item').open);
    }
    finally {
        mock.restoreAll();
        document.body.replaceChildren();
    }
});
test('ProjectsGitLogScreen renders expandable git entries', async () => {
    const { ProjectsGitLogScreen } = await import('./projects-git-log-screen.component.js');
    const { ProjectsService } = await import('../../services/projects.service.js');
    mock.method(ProjectsService, 'fetchMotivationGitLog', async () => gitLog);
    try {
        const screen = new ProjectsGitLogScreen();
        document.body.appendChild(screen);
        await flush();
        await flush();
        const component = screen.querySelector('project-git-log');
        assert.ok(component);
        const shadow = component.shadowRoot;
        assert.strictEqual(shadow.querySelectorAll('.git-item').length, 1);
        assert.match(shadow.querySelector('.item-full-hash').textContent ?? '', /1234567890abcdef/);
    }
    finally {
        mock.restoreAll();
        document.body.replaceChildren();
    }
});
