import { activityIcon, formatTime } from './health-utils.js';
const template = document.createElement('template');
template.innerHTML = `
    <div class="upcoming-date">
        <div class="upcoming-day"></div>
        <div class="upcoming-weekday"></div>
    </div>
    <div class="upcoming-info">
        <div class="upcoming-title"></div>
        <div class="upcoming-time"></div>
    </div>
`;
export class HealthUpcomingItem extends HTMLElement {
    connectedCallback() {
        if (!this.firstChild) {
            this.appendChild(template.content.cloneNode(true));
        }
    }
    set activity(a) {
        const day = this.querySelector('.upcoming-day');
        if (!day)
            return;
        const date = Temporal.PlainDate.from(a.date.split('T')[0]);
        day.textContent = String(date.day);
        this.querySelector('.upcoming-weekday').textContent =
            date.toLocaleString(undefined, { weekday: 'short' });
        const meta = a.metadata ? JSON.parse(a.metadata) : null;
        const startTime = meta?.start ? formatTime(meta.start) : '';
        this.querySelector('.upcoming-title').textContent = `${activityIcon(a.type)} ${a.title}`;
        this.querySelector('.upcoming-time').textContent =
            startTime + (a.duration_minutes ? ` · ${a.duration_minutes} min` : '');
    }
}
customElements.define('health-upcoming-item', HealthUpcomingItem);
