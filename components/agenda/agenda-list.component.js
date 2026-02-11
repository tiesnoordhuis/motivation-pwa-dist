import { AgendaItem } from './agenda-item.component.js';
import styles from './agenda-list.css' with { type: 'css' };
const template = document.createElement('template');
template.innerHTML = `
    <div id="list-container"></div>
`;
const emptyTemplate = document.createElement('template');
emptyTemplate.innerHTML = `
    <p class="empty-state">No upcoming events.</p>
`;
export class AgendaList extends HTMLElement {
    _events = [];
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    set events(events) {
        this._events = events;
        this.render();
    }
    connectedCallback() {
        this.render();
    }
    render() {
        const container = this.shadowRoot.getElementById('list-container');
        container.innerHTML = '';
        if (this._events.length === 0) {
            container.appendChild(emptyTemplate.content.cloneNode(true));
            return;
        }
        const list = document.createElement('div');
        list.classList.add('agenda-list');
        this._events.forEach(event => {
            const item = document.createElement('agenda-item');
            item.dataset.summary = event.summary ?? '';
            item.dataset.start = event.start ?? '';
            item.dataset.end = event.end ?? '';
            if (event.location)
                item.dataset.location = event.location;
            list.appendChild(item);
        });
        container.appendChild(list);
    }
}
customElements.define('agenda-list', AgendaList);
