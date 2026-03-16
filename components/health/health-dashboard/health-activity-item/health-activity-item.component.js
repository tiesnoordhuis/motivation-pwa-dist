import { activityIcon, formatDate } from '../health-utils.js';
const template = document.createElement('template');
template.innerHTML = `
    <div class="activity-icon"></div>
    <div class="activity-info">
        <div class="activity-title"></div>
        <div class="activity-meta"></div>
    </div>
    <span class="activity-source"></span>
`;
export class HealthActivityItem extends HTMLElement {
    connectedCallback() {
        if (!this.firstChild) {
            this.appendChild(template.content.cloneNode(true));
        }
    }
    set activity(a) {
        const icon = this.querySelector('.activity-icon');
        if (!icon)
            return;
        icon.textContent = activityIcon(a.type);
        this.querySelector('.activity-title').textContent = a.title;
        this.querySelector('.activity-meta').textContent =
            formatDate(a.date) + (a.duration_minutes ? ` · ${a.duration_minutes} min` : '');
        this.querySelector('.activity-source').textContent = a.source;
    }
}
customElements.define('health-activity-item', HealthActivityItem);
