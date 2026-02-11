import { test } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
test('GoalNavigator', async (t) => {
    function setupDOM() {
        const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
    <goal-header-card id="goal-header"></goal-header-card>
    <goal-list id="goals-list"></goal-list>
</body>
</html>
        `, { url: 'http://localhost' });
        global.window = dom.window;
        global.document = dom.window.document;
        global.HTMLElement = dom.window.HTMLElement;
        global.customElements = dom.window.customElements;
        global.Event = dom.window.Event;
        global.CustomEvent = dom.window.CustomEvent;
        global.Node = dom.window.Node;
    }
    setupDOM();
    // Mock Web Components
    class MockGoalList extends global.HTMLElement {
        _goals = [];
        set goals(v) { this._goals = v; }
        get goals() { return this._goals; }
    }
    class MockGoalHeaderCard extends global.HTMLElement {
    }
    global.customElements.define('goal-list', MockGoalList);
    global.customElements.define('goal-header-card', MockGoalHeaderCard);
    const { GoalNavigator } = await import('./goal-navigator.js');
    const sampleGoals = [
        {
            id: '1', title: 'Goal 1', status: 'ACTIVE', description: 'Desc 1',
            created_at: '', updated_at: '',
            sub_goals: [
                { id: '1a', title: 'Sub 1a', status: 'ACTIVE', description: '', created_at: '', updated_at: '' }
            ]
        },
        { id: '2', title: 'Goal 2', status: 'COMPLETED', description: 'Desc 2', created_at: '', updated_at: '' }
    ];
    await t.test('findGoal finds a top-level goal', () => {
        setupDOM();
        const nav = new GoalNavigator();
        nav.renderGoals(sampleGoals);
        const found = nav.findGoal(sampleGoals, '2');
        assert.strictEqual(found?.title, 'Goal 2');
    });
    await t.test('findGoal finds a nested goal', () => {
        setupDOM();
        const nav = new GoalNavigator();
        nav.renderGoals(sampleGoals);
        const found = nav.findGoal(sampleGoals, '1a');
        assert.strictEqual(found?.title, 'Sub 1a');
    });
    await t.test('findGoal returns undefined for missing id', () => {
        setupDOM();
        const nav = new GoalNavigator();
        const found = nav.findGoal(sampleGoals, 'nonexistent');
        assert.strictEqual(found, undefined);
    });
    await t.test('findParentNode returns parent of nested goal', () => {
        setupDOM();
        const nav = new GoalNavigator();
        const parent = nav.findParentNode(sampleGoals, '1a');
        assert.strictEqual(parent?.id, '1');
    });
    await t.test('findParentNode returns null for top-level goal', () => {
        setupDOM();
        const nav = new GoalNavigator();
        const parent = nav.findParentNode(sampleGoals, '1');
        assert.strictEqual(parent, null);
    });
    await t.test('renderGoals assigns goals to goal-list component', () => {
        setupDOM();
        const nav = new GoalNavigator();
        nav.renderGoals(sampleGoals);
        const list = document.getElementById('goals-list');
        assert.strictEqual(list.goals.length, 2);
        assert.strictEqual(list.goals[0].title, 'Goal 1');
    });
    await t.test('navigateTo sets currentParentId and shows sub-goals', () => {
        setupDOM();
        const nav = new GoalNavigator();
        nav.renderGoals(sampleGoals);
        nav.navigateTo('1');
        const list = document.getElementById('goals-list');
        assert.strictEqual(list.goals.length, 1);
        assert.strictEqual(list.goals[0].title, 'Sub 1a');
        const header = document.getElementById('goal-header');
        assert.strictEqual(header.dataset.goalId, '1');
        assert.strictEqual(header.dataset.title, 'Goal 1');
    });
    await t.test('navigateUp returns to parent view', () => {
        setupDOM();
        const nav = new GoalNavigator();
        nav.renderGoals(sampleGoals);
        nav.navigateTo('1');
        nav.navigateUp();
        const list = document.getElementById('goals-list');
        assert.strictEqual(list.goals.length, 2);
        const header = document.getElementById('goal-header');
        assert.strictEqual(header.dataset.goalId, undefined);
    });
    await t.test('navigateUp at root level does nothing', () => {
        setupDOM();
        const nav = new GoalNavigator();
        nav.renderGoals(sampleGoals);
        nav.navigateUp();
        const list = document.getElementById('goals-list');
        assert.strictEqual(list.goals.length, 2);
    });
    await t.test('currentParentId getter returns current parent', () => {
        setupDOM();
        const nav = new GoalNavigator();
        nav.renderGoals(sampleGoals);
        assert.strictEqual(nav.currentParentId, null);
        nav.navigateTo('1');
        assert.strictEqual(nav.currentParentId, '1');
    });
});
