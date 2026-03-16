import styles from './activity-card.css' with { type: 'css' };
import { activityIcon } from '../../health-dashboard/health-utils.js';
const template = document.createElement('template');
template.innerHTML = `
    <div class="activity-card" id="activity-card"></div>
`;
export class ActivityCard extends HTMLElement {
    _activities = [];
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    set activities(val) {
        this._activities = val;
        this.render();
    }
    formatDuration(minutes) {
        if (!minutes)
            return '';
        if (minutes >= 60) {
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            return m > 0 ? `${h}h${m}m` : `${h}h`;
        }
        return `${minutes}m`;
    }
    render() {
        if (!this._activities || this._activities.length === 0)
            return;
        const container = this.shadowRoot.getElementById('activity-card');
        container.replaceChildren();
        for (const activity of this._activities) {
            const chip = document.createElement('div');
            chip.className = 'activity-chip';
            const icon = document.createElement('span');
            icon.className = 'chip-icon';
            icon.textContent = activityIcon(activity.type);
            chip.appendChild(icon);
            const dur = this.formatDuration(activity.duration_minutes);
            if (dur) {
                const durEl = document.createElement('span');
                durEl.className = 'chip-duration';
                durEl.textContent = dur;
                chip.appendChild(durEl);
            }
            container.appendChild(chip);
        }
    }
}
customElements.define('activity-card', ActivityCard);
