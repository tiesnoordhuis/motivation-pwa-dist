import styles from './timeline-day.css' with { type: 'css' };
import '../activity-card/activity-card.component.js';
import '../nutrition-card/nutrition-card.component.js';
import { ActivityCard } from '../activity-card/activity-card.component.js';
import { NutritionCard } from '../nutrition-card/nutrition-card.component.js';
import { navigate } from '../../../../router.js';
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const template = document.createElement('template');
template.innerHTML = `
    <div class="timeline-day" id="day-container">
        <div class="day-content">
            <div class="date-header">
                <span class="date-label" id="date-label"></span>
                <span class="date-value" id="date-value"></span>
            </div>
            <div class="split-view">
                <div class="left-pane" id="activities-pane"></div>
                <div class="spine-node"></div>
                <div class="right-pane" id="nutrition-pane"></div>
            </div>
        </div>
    </div>
`;
export class TimelineDay extends HTMLElement {
    _data = null;
    _onDayClick = null;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
        shadow.getElementById('day-container').addEventListener('click', () => {
            if (this._onDayClick && this._data) {
                this._onDayClick(this._data.date);
            }
            else if (this._data) {
                navigate(`#/health/day/${this._data.date}`);
            }
        });
    }
    set onDayClick(handler) {
        this._onDayClick = handler;
    }
    set dayData(value) {
        this._data = value;
        this.render();
    }
    formatDateHeader(dateStr) {
        const d = Temporal.PlainDate.from(dateStr);
        const today = Temporal.Now.plainDateISO();
        const dateValue = `${d.day} ${MONTHS[d.month - 1]}`;
        if (d.equals(today)) {
            return { label: 'Today', value: dateValue };
        }
        const yesterday = today.subtract({ days: 1 });
        if (d.equals(yesterday)) {
            return { label: 'Yesterday', value: dateValue };
        }
        const jsDayOfWeek = d.dayOfWeek === 7 ? 0 : d.dayOfWeek;
        return { label: WEEKDAYS[jsDayOfWeek], value: dateValue };
    }
    render() {
        if (!this._data)
            return;
        const shadow = this.shadowRoot;
        const { label, value } = this.formatDateHeader(this._data.date);
        shadow.getElementById('date-label').textContent = label;
        shadow.getElementById('date-value').textContent = value;
        const activitiesPane = shadow.getElementById('activities-pane');
        activitiesPane.replaceChildren();
        if (this._data.activities.length > 0) {
            const card = document.createElement('activity-card');
            card.activities = this._data.activities;
            activitiesPane.appendChild(card);
        }
        const nutritionPane = shadow.getElementById('nutrition-pane');
        nutritionPane.replaceChildren();
        if (this._data.nutrition.length > 0) {
            const card = document.createElement('nutrition-card');
            card.entries = this._data.nutrition;
            nutritionPane.appendChild(card);
        }
        // Ensure even empty days have sufficient height
        if (this._data.activities.length === 0 && this._data.nutrition.length === 0) {
            shadow.getElementById('day-container').classList.add('empty-day');
        }
        else {
            shadow.getElementById('day-container').classList.remove('empty-day');
        }
    }
}
customElements.define('timeline-day', TimelineDay);
