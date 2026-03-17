import styles from './health-day-detail.css' with { type: 'css' };
import { MEAL_TYPES } from '@motivation/shared';
import './activity-detail-card.component.js';
import { navigate } from '../../../router.js';
const template = document.createElement('template');
template.innerHTML = `
    <div class="day-detail-container">
        <header class="detail-header">
            <button class="nav-btn" id="prev-btn" title="Previous Day">←</button>
            <h2 id="day-title" class="date-title">Day Detail</h2>
            <button class="nav-btn" id="next-btn" title="Next Day">→</button>
        </header>

        <div id="loading" class="loading" hidden>
            <div class="spinner"></div>
            <div>Loading data...</div>
        </div>

        <div id="error" class="error-banner" hidden></div>

        <div id="content" hidden>
            <section class="summary-card">
                <div class="summary-main">
                    <span class="cal-val" id="total-cal">0</span>
                    <span class="cal-unit">kcal total</span>
                </div>
                <div class="summary-macros">
                    <div class="macro-badge">Protein: <span id="total-p">0</span>g</div>
                    <div class="macro-badge">Carbs: <span id="total-c">0</span>g</div>
                    <div class="macro-badge">Fat: <span id="total-f">0</span>g</div>
                </div>
            </section>

            <section class="detail-section">
                <div class="section-header">
                    <h3>Workouts</h3>
                    <button class="add-mini-btn" id="add-workout-btn" title="Add Workout">+</button>
                </div>
                <div id="workouts-list">
                    <div class="empty-state">No workouts logged.</div>
                </div>
            </section>

            <section class="detail-section">
                <div class="section-header">
                    <h3>Breakfast</h3>
                    <button class="add-mini-btn" data-meal="Breakfast" title="Add Breakfast">+</button>
                </div>
                <div id="breakfast-list" class="food-list">
                    <div class="empty-state">Nothing logged yet.</div>
                </div>
            </section>

            <section class="detail-section">
                <div class="section-header">
                    <h3>Lunch</h3>
                    <button class="add-mini-btn" data-meal="Lunch" title="Add Lunch">+</button>
                </div>
                <div id="lunch-list" class="food-list">
                    <div class="empty-state">Nothing logged yet.</div>
                </div>
            </section>

            <section class="detail-section">
                <div class="section-header">
                    <h3>Dinner</h3>
                    <button class="add-mini-btn" data-meal="Dinner" title="Add Dinner">+</button>
                </div>
                <div id="dinner-list" class="food-list">
                    <div class="empty-state">Nothing logged yet.</div>
                </div>
            </section>

            <section class="detail-section">
                <div class="section-header">
                    <h3>Snacks</h3>
                    <button class="add-mini-btn" data-meal="Snacks" title="Add Snacks">+</button>
                </div>
                <div id="snacks-list" class="food-list">
                    <div class="empty-state">Nothing logged yet.</div>
                </div>
            </section>
        </div>
    </div>
`;
export class HealthDayDetail extends HTMLElement {
    _dateStr = '';
    _activities = [];
    _nutrition = [];
    _summary = null;
    // Handlers
    _onAddWorkout = null;
    _onAddFood = null;
    _onEditFood = null;
    _onEditWorkout = null;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
        shadow.getElementById('prev-btn').addEventListener('click', () => {
            if (!this._dateStr)
                return;
            const prevDay = Temporal.PlainDate.from(this._dateStr).subtract({ days: 1 }).toString();
            navigate(`#/health/day/${prevDay}`);
        });
        shadow.getElementById('next-btn').addEventListener('click', () => {
            if (!this._dateStr)
                return;
            const nextDay = Temporal.PlainDate.from(this._dateStr).add({ days: 1 }).toString();
            navigate(`#/health/day/${nextDay}`);
        });
        shadow.getElementById('add-workout-btn').addEventListener('click', () => {
            if (this._onAddWorkout && this._dateStr)
                this._onAddWorkout(this._dateStr);
        });
        const foodBtns = shadow.querySelectorAll('button[data-meal]');
        foodBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mealType = e.currentTarget.dataset.meal;
                if (this._onAddFood && this._dateStr && mealType) {
                    this._onAddFood(this._dateStr, mealType);
                }
            });
        });
    }
    set onAddWorkout(handler) { this._onAddWorkout = handler; }
    set onAddFood(handler) { this._onAddFood = handler; }
    set onEditFood(handler) { this._onEditFood = handler; }
    set onEditWorkout(handler) { this._onEditWorkout = handler; }
    set dateContext(val) {
        this._dateStr = val;
        this.shadowRoot.getElementById('day-title').textContent = val;
    }
    get dateContext() {
        return this._dateStr;
    }
    set activities(data) {
        this._activities = data;
        this.renderWorkouts();
    }
    set nutrition(data) {
        this._nutrition = data;
        this.renderNutrition();
        this.renderSummary(); // Fix: ensure summary updates when we receive individual entries
    }
    set summary(data) {
        this._summary = data;
        this.renderSummary();
    }
    showLoading() {
        const shadow = this.shadowRoot;
        shadow.getElementById('loading').hidden = false;
        shadow.getElementById('content').hidden = true;
        shadow.getElementById('error').hidden = true;
    }
    hideLoading() {
        this.shadowRoot.getElementById('loading').hidden = true;
    }
    showError(message) {
        const shadow = this.shadowRoot;
        const el = shadow.getElementById('error');
        el.textContent = message;
        el.hidden = false;
        shadow.getElementById('loading').hidden = true;
    }
    showContent() {
        this.shadowRoot.getElementById('content').hidden = false;
    }
    renderSummary() {
        const shadow = this.shadowRoot;
        let cal = 0, p = 0, c = 0, f = 0;
        if (this._summary) {
            cal = this._summary.total_calories;
            p = this._summary.total_protein_g;
            c = this._summary.total_carbs_g;
            f = this._summary.total_fat_g;
        }
        else if (this._nutrition.length > 0) {
            // Fallback aggregation if summary not provided yet
            cal = this._nutrition.reduce((s, e) => s + (e.calories ?? 0), 0);
            p = this._nutrition.reduce((s, e) => s + (e.protein_g ?? 0), 0);
            c = this._nutrition.reduce((s, e) => s + (e.carbs_g ?? 0), 0);
            f = this._nutrition.reduce((s, e) => s + (e.fat_g ?? 0), 0);
        }
        shadow.getElementById('total-cal').textContent = String(Math.round(cal));
        shadow.getElementById('total-p').textContent = String(Math.round(p));
        shadow.getElementById('total-c').textContent = String(Math.round(c));
        shadow.getElementById('total-f').textContent = String(Math.round(f));
    }
    renderWorkouts() {
        const container = this.shadowRoot.getElementById('workouts-list');
        container.replaceChildren();
        if (this._activities.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.textContent = 'No workouts logged.';
            container.appendChild(emptyState);
            return;
        }
        for (const act of this._activities) {
            const card = document.createElement('activity-detail-card');
            card.activity = act;
            if (act.source === 'manual') {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    if (this._onEditWorkout)
                        this._onEditWorkout(act);
                });
            }
            container.appendChild(card);
        }
    }
    renderNutrition() {
        const shadow = this.shadowRoot;
        for (const meal of MEAL_TYPES) {
            const container = shadow.getElementById(`${meal.toLowerCase()}-list`);
            container.replaceChildren();
            const entries = this._nutrition.filter(e => e.meal_type && e.meal_type.toLowerCase() === meal.toLowerCase());
            if (entries.length === 0) {
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                emptyState.textContent = 'Nothing logged yet.';
                container.appendChild(emptyState);
                continue;
            }
            for (const entry of entries) {
                const item = document.createElement('div');
                item.className = 'food-item';
                item.style.cursor = 'pointer';
                const name = document.createElement('span');
                name.className = 'food-name';
                name.textContent = entry.food_name ?? 'Unknown food';
                const cals = document.createElement('span');
                cals.className = 'food-cals';
                cals.textContent = `${Math.round(entry.calories ?? 0)} kcal`;
                item.appendChild(name);
                item.appendChild(cals);
                item.addEventListener('click', () => {
                    if (this._onEditFood)
                        this._onEditFood(entry);
                });
                container.appendChild(item);
            }
        }
    }
}
customElements.define('health-day-detail', HealthDayDetail);
