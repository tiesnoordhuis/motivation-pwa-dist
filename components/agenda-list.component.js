import './agenda-item.component.js';
export class AgendaList extends HTMLElement {
    _events = [];
    constructor() {
        super();
    }
    set events(events) {
        this._events = events;
        this.render();
    }
    connectedCallback() {
        this.render();
    }
    render() {
        this.innerHTML = '';
        if (this._events.length === 0) {
            this.innerHTML = '<p class="empty-state">No upcoming events.</p>';
            return;
        }
        const list = document.createElement('div');
        list.className = 'agenda-list';
        this._events.forEach(event => {
            const item = document.createElement('agenda-item');
            item.event = event;
            list.appendChild(item);
        });
        this.appendChild(list);
    }
}
customElements.define('agenda-list', AgendaList);
