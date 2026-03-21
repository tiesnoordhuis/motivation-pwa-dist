import { HealthService } from '../../services/health.service.js';
import { navigate } from '../../router.js';
import { buildSectionPage } from '../../utils/section-page.utils.js';
import './health-day-detail/health-day-detail.component.js';
import './nutrition-edit/nutrition-edit.component.js';
import './activity-edit/activity-edit.component.js';
import { ACTIVITY_TYPES } from '@motivation/shared';
const addActivityTemplate = document.createElement('template');
addActivityTemplate.innerHTML = `
    <dialog class="activity-dialog" id="activity-dialog">
        <form method="dialog" id="activity-form">
            <h2>Log Activity</h2>
            <div class="form-group">
                <label for="act-title">Title</label>
                <input type="text" id="act-title" required placeholder="e.g. Morning run">
            </div>
            <div class="form-group">
                <label for="act-type">Type</label>
                <select id="act-type">
                    ${ACTIVITY_TYPES.map((type) => `<option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="act-date">Date</label>
                <input type="date" id="act-date" required>
            </div>
            <div class="form-group">
                <label for="act-duration">Duration (minutes)</label>
                <input type="number" id="act-duration" min="1" placeholder="60">
            </div>
            <div class="dialog-actions">
                <button value="cancel" formnovalidate>Cancel</button>
                <button value="save" class="btn-primary">Save</button>
            </div>
        </form>
    </dialog>
`;
export class HealthDayScreen extends HTMLElement {
    initialized = false;
    detail = null;
    loadSequence = 0;
    dateValue = '';
    dialogRoot = null;
    set date(value) {
        this.dateValue = value;
    }
    connectedCallback() {
        if (!this.initialized) {
            this.initialized = true;
            const page = buildSectionPage(this, 'Health', 'health', '#/health');
            this.detail = document.createElement('health-day-detail');
            this.detail.dateContext = this.dateValue;
            this.detail.showLoading();
            page.content.appendChild(this.detail);
            this.dialogRoot = document.createElement('div');
            page.content.appendChild(this.dialogRoot);
            this.dialogRoot.appendChild(addActivityTemplate.content.cloneNode(true));
            this.wireDetail();
            this.wireAddDialog();
        }
        if (this.detail) {
            this.detail.dateContext = this.dateValue;
        }
        void this.loadData();
    }
    wireDetail() {
        if (!this.detail)
            return;
        this.detail.addEventListener('health:add-workout', (event) => {
            const { detail } = event;
            this.openManualAddDialog(detail.date);
        });
        this.detail.addEventListener('health:add-food', (event) => {
            const { detail } = event;
            navigate(`#/health/food-entry/${encodeURIComponent(detail.date)}/${encodeURIComponent(detail.meal)}`);
        });
        this.detail.addEventListener('health:edit-food', (event) => {
            const { detail } = event;
            this.showNutritionEditor(detail.entry);
        });
        this.detail.addEventListener('health:edit-workout', (event) => {
            const { detail } = event;
            this.showActivityEditor(detail.activity);
        });
    }
    wireAddDialog() {
        const dialog = this.querySelector('#activity-dialog');
        const form = this.querySelector('#activity-form');
        if (!dialog || !form)
            return;
        dialog.addEventListener('close', () => {
            if (dialog.returnValue !== 'save') {
                form.reset();
                return;
            }
            const title = this.querySelector('#act-title')?.value ?? '';
            const type = this.querySelector('#act-type')?.value ?? 'other';
            const date = this.querySelector('#act-date')?.value ?? '';
            const durationStr = this.querySelector('#act-duration')?.value ?? '';
            const duration = durationStr ? parseInt(durationStr, 10) : undefined;
            if (!title || !date) {
                form.reset();
                return;
            }
            void this.saveManualActivity({
                title,
                type: type,
                date,
                duration_minutes: duration,
            });
            form.reset();
        });
    }
    async saveManualActivity(data) {
        try {
            await HealthService.createActivity(data);
            await this.loadData();
        }
        catch (err) {
            console.error('Failed to create activity', err);
            this.detail?.showError('Failed to save activity.');
        }
    }
    openManualAddDialog(date) {
        const dialog = this.querySelector('#activity-dialog');
        const dateInput = this.querySelector('#act-date');
        if (!dialog || !dateInput)
            return;
        dateInput.value = date;
        dialog.showModal();
    }
    async loadData() {
        if (!this.detail)
            return;
        const currentLoad = ++this.loadSequence;
        this.detail.dateContext = this.dateValue;
        this.detail.showLoading();
        try {
            const [activities, nutrition] = await Promise.all([
                HealthService.fetchActivitiesByDate(this.dateValue),
                HealthService.fetchNutritionByDate(this.dateValue),
            ]);
            if (currentLoad !== this.loadSequence || !this.detail)
                return;
            this.detail.activities = activities;
            this.detail.nutrition = nutrition;
            this.detail.hideLoading();
            this.detail.showContent();
        }
        catch (err) {
            console.error('Failed to load day detail data', err);
            if (currentLoad === this.loadSequence) {
                this.detail.showError(`Failed to load detail for ${this.dateValue}`);
            }
        }
    }
    showNutritionEditor(entry) {
        if (!this.detail || !this.dialogRoot)
            return;
        this.detail.hidden = true;
        const editor = document.createElement('nutrition-edit');
        editor.entry = entry;
        editor.onSave = async (id, updates) => {
            try {
                await HealthService.updateNutritionEntry(id, updates);
                editor.remove();
                this.detail.hidden = false;
                await this.loadData();
            }
            catch (err) {
                console.error('Failed to update nutrition entry', err);
            }
        };
        editor.onDelete = async (id) => {
            try {
                await HealthService.deleteNutritionEntry(id);
                editor.remove();
                this.detail.hidden = false;
                await this.loadData();
            }
            catch (err) {
                console.error('Failed to delete nutrition entry', err);
            }
        };
        this.dialogRoot.appendChild(editor);
    }
    showActivityEditor(activity) {
        if (!this.detail || !this.dialogRoot)
            return;
        this.detail.hidden = true;
        const editor = document.createElement('activity-edit');
        editor.activity = activity;
        editor.onSave = async (id, updates) => {
            try {
                await HealthService.updateActivity(id, updates);
                editor.remove();
                this.detail.hidden = false;
                await this.loadData();
            }
            catch (err) {
                console.error('Failed to update activity', err);
            }
        };
        editor.onDelete = async (id) => {
            try {
                await HealthService.deleteActivity(id);
                editor.remove();
                this.detail.hidden = false;
                await this.loadData();
            }
            catch (err) {
                console.error('Failed to delete activity', err);
            }
        };
        this.dialogRoot.appendChild(editor);
    }
}
customElements.define('health-day-screen', HealthDayScreen);
