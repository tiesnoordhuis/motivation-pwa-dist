import { test } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';
test('GoalDialogController', async (t) => {
    function setupDOM() {
        const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
    <button id="create-goal-btn">New</button>
    <dialog id="goal-dialog">
        <form id="goal-form">
            <h2 id="dialog-title"></h2>
            <input id="goal-id" name="id">
            <input id="goal-parent-id" name="parent_id">
            <input id="goal-title-input" name="title">
            <textarea id="goal-desc-input" name="description"></textarea>
            <select id="goal-status-input" name="status">
                <option value="ACTIVE">Active</option>
            </select>
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
            <button value="ACTIVE" class="btn-status">Active</button>
            <button value="COMPLETED" class="btn-status">Completed</button>
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
        global.HTMLInputElement = dom.window.HTMLInputElement;
        global.customElements = dom.window.customElements;
        global.Event = dom.window.Event;
        global.CustomEvent = dom.window.CustomEvent;
        global.Node = dom.window.Node;
        global.FormData = dom.window.FormData;
        // Mock Dialog methods
        dom.window.HTMLDialogElement.prototype.showModal = function () { this._open = true; };
        dom.window.HTMLDialogElement.prototype.close = function () { this._open = false; };
    }
    setupDOM();
    const { GoalDialogController } = await import('./goal-dialog.controller.js');
    await t.test('openGoalDialog with null resets form and shows modal for new goal', () => {
        setupDOM();
        const controller = new GoalDialogController(async () => { });
        controller.openGoalDialog(null, null);
        const dialog = document.getElementById('goal-dialog');
        const title = document.getElementById('dialog-title');
        const idInput = document.getElementById('goal-id');
        const statusInput = document.getElementById('goal-status-input');
        assert.strictEqual(title.textContent, 'New Goal');
        assert.strictEqual(idInput.value, '');
        assert.strictEqual(statusInput.value, 'ACTIVE');
        assert.strictEqual(dialog._open, true);
    });
    await t.test('openGoalDialog with goal populates fields for editing', () => {
        setupDOM();
        const controller = new GoalDialogController(async () => { });
        const goal = {
            id: 'g1', title: 'Test Goal', status: 'COMPLETED',
            description: 'A description', created_at: '', updated_at: ''
        };
        controller.openGoalDialog(goal);
        const title = document.getElementById('dialog-title');
        const idInput = document.getElementById('goal-id');
        const titleInput = document.getElementById('goal-title-input');
        const statusInput = document.getElementById('goal-status-input');
        const descInput = document.getElementById('goal-desc-input');
        assert.strictEqual(title.textContent, 'Edit Goal');
        assert.strictEqual(idInput.value, 'g1');
        assert.strictEqual(titleInput.value, 'Test Goal');
        assert.strictEqual(descInput.value, 'A description');
    });
    await t.test('openConfirmDelete stores pending id and shows confirm dialog', () => {
        setupDOM();
        const controller = new GoalDialogController(async () => { });
        controller.openConfirmDelete('del-1');
        const dialog = document.getElementById('confirm-dialog');
        assert.strictEqual(dialog._open, true);
    });
    await t.test('openStatusDialog stores goal and shows status dialog', () => {
        setupDOM();
        const controller = new GoalDialogController(async () => { });
        const goal = {
            id: 's1', title: 'Status Goal', status: 'ACTIVE',
            description: '', created_at: '', updated_at: ''
        };
        controller.openStatusDialog(goal);
        const dialog = document.getElementById('status-dialog');
        assert.strictEqual(dialog._open, true);
    });
});
