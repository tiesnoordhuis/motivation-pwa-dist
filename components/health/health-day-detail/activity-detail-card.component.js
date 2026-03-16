import styles from './activity-detail-card.css' with { type: 'css' };
import { activityIcon } from '../health-dashboard/health-utils.js';
const SOURCE_ICONS = {
    manual: '✏️',
    strava: '🟧',
    calendar: '📅',
};
const template = document.createElement('template');
template.innerHTML = `
    <div class="detail-card">
        <div class="card-left">
            <div class="type-icon" id="type-icon"></div>
        </div>
        <div class="card-body">
            <div class="card-title" id="title"></div>
            <div class="card-meta" id="meta"></div>
        </div>
        <div class="card-right">
            <span class="source-badge" id="source-badge" title=""></span>
        </div>
    </div>
`;
export class ActivityDetailCard extends HTMLElement {
    _activity = null;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    set activity(val) {
        this._activity = val;
        this.render();
    }
    formatDuration(minutes) {
        if (!minutes)
            return '';
        if (minutes >= 60) {
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            return m > 0 ? `${h}h ${m}min` : `${h}h`;
        }
        return `${minutes} min`;
    }
    render() {
        const a = this._activity;
        if (!a)
            return;
        const shadow = this.shadowRoot;
        shadow.getElementById('type-icon').textContent = activityIcon(a.type);
        shadow.getElementById('title').textContent = a.title;
        // Build meta line: duration · calories
        const parts = [];
        const dur = this.formatDuration(a.duration_minutes);
        if (dur)
            parts.push(dur);
        if (a.calories_burned)
            parts.push(`${Math.round(a.calories_burned)} kcal`);
        if (a.description)
            parts.push(a.description);
        shadow.getElementById('meta').textContent = parts.join(' · ');
        const sourceEl = shadow.getElementById('source-badge');
        sourceEl.textContent = SOURCE_ICONS[a.source] ?? '❓';
        sourceEl.title = a.source.charAt(0).toUpperCase() + a.source.slice(1);
    }
}
customElements.define('activity-detail-card', ActivityDetailCard);
