import styles from './agenda-item.css' with { type: 'css' };
const template = document.createElement('template');
template.innerHTML = `
    <div class="agenda-item">
        <div class="agenda-time">
            <span class="agenda-date" id="date"></span>
            <span class="agenda-hours" id="hours"></span>
        </div>
        <div class="agenda-details" id="details">
            <h3 class="agenda-summary" id="summary"></h3>
        </div>
    </div>
`;
export class AgendaItem extends HTMLElement {
    static get observedAttributes() {
        return ['data-summary', 'data-start', 'data-end', 'data-location'];
    }
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    attributeChangedCallback(_name, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        this.update();
    }
    formatTime(dateString) {
        if (!dateString)
            return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    formatDate(dateString) {
        if (!dateString)
            return '';
        const date = new Date(dateString);
        return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }
    update() {
        const shadow = this.shadowRoot;
        const start = this.dataset.start;
        const end = this.dataset.end;
        shadow.getElementById('date').textContent = this.formatDate(start);
        shadow.getElementById('hours').textContent = `${this.formatTime(start)} - ${this.formatTime(end)}`;
        shadow.getElementById('summary').textContent = this.dataset.summary ?? '';
        // Handle optional location element
        const details = shadow.getElementById('details');
        let locationEl = shadow.getElementById('location');
        if (this.dataset.location) {
            if (!locationEl) {
                locationEl = document.createElement('p');
                locationEl.id = 'location';
                locationEl.classList.add('agenda-location');
                details.appendChild(locationEl);
            }
            locationEl.textContent = `📍 ${this.dataset.location}`;
        }
        else if (locationEl) {
            locationEl.remove();
        }
    }
}
customElements.define('agenda-item', AgendaItem);
