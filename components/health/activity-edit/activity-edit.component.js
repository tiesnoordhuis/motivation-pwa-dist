import styles from './activity-edit.css' with { type: 'css' };
import { ACTIVITY_TYPES } from '@motivation/shared';
const template = document.createElement('template');
template.innerHTML = `
    <div class="edit-container">
        <div class="edit-header">
            <h3>Edit Workout</h3>
        </div>

        <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" class="form-input" placeholder="e.g. Morning run">
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="type">Type</label>
                <select id="type" class="form-select">
                    ${ACTIVITY_TYPES.map(t => `<option value="${t}">${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="date">Date</label>
                <input type="date" id="date" class="form-input">
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="duration">Duration (min)</label>
                <input type="number" id="duration" class="form-input" min="0" placeholder="optional">
            </div>
            <div class="form-group">
                <label for="calories">Calories burned</label>
                <input type="number" id="calories" class="form-input" min="0" placeholder="optional">
            </div>
        </div>

        <div class="form-group">
            <label for="description">Notes</label>
            <input type="text" id="description" class="form-input" placeholder="optional">
        </div>

        <div class="action-buttons">
            <button class="btn-delete" id="btn-delete">Delete</button>
            <button class="btn-save" id="btn-save">Save</button>
        </div>
    </div>
`;
export class ActivityEdit extends HTMLElement {
    _activity = null;
    _onSave = null;
    _onDelete = null;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        const shadow = this.shadowRoot;
        shadow.getElementById('btn-save').addEventListener('click', () => this.handleSave());
        shadow.getElementById('btn-delete').addEventListener('click', () => this.handleDelete());
    }
    set onSave(handler) {
        this._onSave = handler;
    }
    set onDelete(handler) {
        this._onDelete = handler;
    }
    set activity(val) {
        this._activity = val;
        this.populateForm();
    }
    get activity() {
        return this._activity;
    }
    populateForm() {
        const a = this._activity;
        if (!a)
            return;
        const shadow = this.shadowRoot;
        shadow.getElementById('title').value = a.title;
        shadow.getElementById('type').value = a.type;
        shadow.getElementById('date').value = a.date;
        shadow.getElementById('duration').value = a.duration_minutes ? String(a.duration_minutes) : '';
        shadow.getElementById('calories').value = a.calories_burned ? String(a.calories_burned) : '';
        shadow.getElementById('description').value = a.description ?? '';
    }
    handleSave() {
        if (!this._activity || !this._onSave)
            return;
        const shadow = this.shadowRoot;
        const title = shadow.getElementById('title').value.trim();
        if (!title)
            return;
        const duration = parseInt(shadow.getElementById('duration').value, 10);
        const calories = parseInt(shadow.getElementById('calories').value, 10);
        const updates = {
            title,
            type: shadow.getElementById('type').value,
            date: shadow.getElementById('date').value,
            description: shadow.getElementById('description').value.trim() || undefined,
            duration_minutes: isNaN(duration) ? undefined : duration,
            calories_burned: isNaN(calories) ? undefined : calories,
        };
        this._onSave(this._activity.id, updates);
    }
    handleDelete() {
        if (!this._activity || !this._onDelete)
            return;
        if (confirm(`Delete "${this._activity.title}"?`)) {
            this._onDelete(this._activity.id);
        }
    }
}
customElements.define('activity-edit', ActivityEdit);
