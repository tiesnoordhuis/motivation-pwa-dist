import { test } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
test('GoalRenderer', async (t) => {
    function setupDOM() {
        const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
    <div class="actions">
       <goal-header-card id="goal-header"></goal-header-card>
    </div>
    <div id="loading-indicator" class="hidden">Loading...</div>
    <p id="error-message" class="hidden"></p>
    
    <button id="create-goal-btn">New</button>
    <goal-list id="goals-list"></goal-list>

    <dialog id="goal-dialog">
        <form id="goal-form">
            <h2 id="dialog-title"></h2>
            <input id="goal-id" name="id">
            <input id="goal-parent-id" name="parent_id">
            <input id="goal-title-input" name="title">
            <textarea id="goal-desc-input" name="description"></textarea>
            <select id="goal-status-input" name="status"></select>
            <button value="save">Save</button>
            <button value="cancel">Cancel</button>
        </form>
    </dialog>
    <dialog id="confirm-dialog">
        <form>
            <button value="confirm">Delete</button>
            <button value="cancel">Cancel</button>
        </form>
    </dialog>
    <dialog id="status-dialog">
        <form id="status-form">
        </form>
    </dialog>
</body>
</html>
        `, { url: 'http://localhost' });
        global.window = dom.window;
        global.document = dom.window.document;
        global.HTMLElement = dom.window.HTMLElement;
        global.HTMLDialogElement = dom.window.HTMLDialogElement;
        global.HTMLFormElement = dom.window.HTMLFormElement;
        global.HTMLButtonElement = dom.window.HTMLButtonElement;
        global.HTMLSelectElement = dom.window.HTMLSelectElement;
        global.customElements = dom.window.customElements;
        global.Event = dom.window.Event;
        global.CustomEvent = dom.window.CustomEvent;
        global.Node = dom.window.Node;
        global.FormData = dom.window.FormData;
    }
    setupDOM();
    // Mock Web Components
    class MockGoalList extends global.HTMLElement {
        _goals = [];
        set goals(v) { this._goals = v; }
        get goals() { return this._goals; }
    }
    class MockGoalHeaderCard extends global.HTMLElement {
        _goal = null;
        set goal(v) { this._goal = v; }
        get goal() { return this._goal; }
    }
    global.customElements.define('goal-list', MockGoalList);
    global.customElements.define('goal-header-card', MockGoalHeaderCard);
    // Mock Dialog
    global.HTMLDialogElement.prototype.showModal = () => { };
    global.HTMLDialogElement.prototype.close = () => { };
    const { GoalRenderer } = await import('./goal.renderer.js');
    await t.test('renderGoals assigns goals to goal-list component', () => {
        setupDOM();
        const renderer = new GoalRenderer();
        const goals = [
            { id: '1', title: 'Goal 1', status: 'ACTIVE', description: 'Desc 1', created_at: '', updated_at: '' },
            { id: '2', title: 'Goal 2', status: 'COMPLETED', description: 'Desc 2', created_at: '', updated_at: '' }
        ];
        renderer.renderGoals(goals);
        const list = document.getElementById('goals-list');
        assert.strictEqual(list.goals.length, 2);
        assert.strictEqual(list.goals[0].title, 'Goal 1');
        assert.strictEqual(list.goals[1].title, 'Goal 2');
    });
    await t.test('renderGoals handles empty list', () => {
        setupDOM();
        const list = document.getElementById('goals-list');
        const renderer = new GoalRenderer();
        renderer.renderGoals([]);
        assert.strictEqual(list.goals.length, 0);
    });
});
