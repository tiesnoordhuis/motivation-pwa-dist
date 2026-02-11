import { GoalItem } from './goal-item.component.js';
import styles from './goal-list.css' with { type: 'css' };
const template = document.createElement('template');
template.innerHTML = `
    <div id="list-container"></div>
`;
const emptyTemplate = document.createElement('template');
emptyTemplate.innerHTML = `
    <div class="empty-state">No goals here yet.</div>
`;
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
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        this.render();
    }
    render() {
        const container = this.shadowRoot.getElementById('list-container');
        container.innerHTML = '';
        if (this._goals.length === 0) {
            container.appendChild(emptyTemplate.content.cloneNode(true));
            return;
        }
        this._goals.forEach(goal => {
            const item = document.createElement('goal-item');
            item.dataset.goalId = goal.id;
            item.dataset.title = goal.title;
            item.dataset.description = goal.description ?? '';
            item.dataset.status = goal.status;
            item.subGoals = goal.sub_goals ?? [];
            container.appendChild(item);
        });
    }
}
customElements.define('goal-list', GoalList);
