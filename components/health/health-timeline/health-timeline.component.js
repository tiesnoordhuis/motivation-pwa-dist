import styles from './health-timeline.css' with { type: 'css' };
import './timeline-day/timeline-day.component.js';
export function mergeTimelineData(activities, nutrition) {
    const merged = new Map();
    for (const activity of activities) {
        // activities have ISO string, extract YYYY-MM-DD
        const dateStr = activity.date.split('T')[0];
        if (!merged.has(dateStr)) {
            merged.set(dateStr, { date: dateStr, activities: [], nutrition: [] });
        }
        merged.get(dateStr).activities.push(activity);
    }
    for (const entry of nutrition) {
        const dateStr = entry.date;
        if (!merged.has(dateStr)) {
            merged.set(dateStr, { date: dateStr, activities: [], nutrition: [] });
        }
        merged.get(dateStr).nutrition.push(entry);
    }
    return merged;
}
const template = document.createElement('template');
template.innerHTML = `
    <div class="health-timeline-container">
        <div class="timeline-header">
            <div class="stat-badge">
                <span class="stat-icon">🔥</span>
                <span id="streak-stat">0-day streak</span>
            </div>
            <div class="stat-badge">
                <span class="stat-icon">🎯</span>
                <span id="avg-cal-stat">0 kcal avg</span>
            </div>
        </div>
        <div class="timeline-scroll-area">
            <div class="timeline-spine-layer"></div>
            <div id="timeline-list"></div>
        </div>
    </div>
`;
export class HealthTimeline extends HTMLElement {
    _activities = [];
    _nutrition = [];
    _streak = 0;
    _avgCalories = 0;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    set streak(value) {
        this._streak = value;
        this.shadowRoot.getElementById('streak-stat').textContent = `${value}-day streak`;
    }
    set avgCalories(value) {
        this._avgCalories = value;
        this.shadowRoot.getElementById('avg-cal-stat').textContent = `${Math.round(value)} kcal avg`;
    }
    set activities(data) {
        this._activities = data;
        this.render();
    }
    set nutrition(data) {
        this._nutrition = data;
        this.render();
    }
    render() {
        // Wait for both data sources (or decide how to handle partial)
        const merged = mergeTimelineData(this._activities, this._nutrition);
        const container = this.shadowRoot.getElementById('timeline-list');
        container.replaceChildren();
        // Generate date sequence from newest to oldest
        if (merged.size === 0)
            return;
        const dates = Array.from(merged.keys()).sort().reverse();
        if (dates.length === 0)
            return;
        const today = Temporal.Now.plainDateISO();
        let currentIter = Temporal.PlainDate.from(dates[0]); // Starts from the newest (could be future)
        const oldestDataDate = Temporal.PlainDate.from(dates[dates.length - 1]);
        // If newest data is older than today, start from today anyway to show timeline continuity
        if (Temporal.PlainDate.compare(currentIter, today) < 0) {
            currentIter = today;
        }
        while (Temporal.PlainDate.compare(currentIter, oldestDataDate) >= 0) {
            const dateStr = currentIter.toString();
            const dayData = merged.get(dateStr) ?? { date: dateStr, activities: [], nutrition: [] };
            const dayElement = document.createElement('timeline-day');
            dayElement.dayData = dayData;
            container.appendChild(dayElement);
            currentIter = currentIter.subtract({ days: 1 });
        }
    }
}
customElements.define('health-timeline', HealthTimeline);
