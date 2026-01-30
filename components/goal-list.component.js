import './goal-item.component.js';
export class GoalList extends HTMLElement {
    _goals = [];
    set goals(value) {
        this._goals = value;
        this.render();
    }
    get goals() {
        return this._goals;
    }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        if (!this.shadowRoot?.firstChild)
            this.render();
    }
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                }
                .empty-state {
                    text-align: center;
                    padding: 2rem;
                    color: #777;
                    font-style: italic;
                }
            </style>
            <div id="list-container">
                ${this._goals.length === 0
            ? '<div class="empty-state">No goals here yet.</div>'
            : ''}
            </div>
        `;
        if (this._goals.length > 0) {
            const container = this.shadowRoot.getElementById('list-container');
            this._goals.forEach(goal => {
                const item = document.createElement('goal-item');
                item.goal = goal;
                item.dataset.id = goal.id;
                container.appendChild(item);
            });
        }
    }
}
customElements.define('goal-list', GoalList);
