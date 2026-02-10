export class AgendaItem extends HTMLElement {
    _event = null;
    static get observedAttributes() {
        return [];
    }
    constructor() {
        super();
    }
    set event(event) {
        this._event = event;
        this.render();
    }
    connectedCallback() {
        this.render();
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
    render() {
        if (!this._event) {
            this.innerHTML = '';
            return;
        }
        const { summary, start, end, location } = this._event;
        const startTime = this.formatTime(start);
        const endTime = this.formatTime(end);
        const date = this.formatDate(start);
        this.innerHTML = `
            <div class="agenda-item card">
                <div class="agenda-time">
                    <span class="agenda-date">${date}</span>
                    <span class="agenda-hours">${startTime} - ${endTime}</span>
                </div>
                <div class="agenda-details">
                    <h3 class="agenda-summary">${summary}</h3>
                    ${location ? `<p class="agenda-location">📍 ${location}</p>` : ''}
                </div>
            </div>
        `;
    }
}
customElements.define('agenda-item', AgendaItem);
