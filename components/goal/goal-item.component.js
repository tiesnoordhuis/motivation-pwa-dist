import styles from './goal-item.css' with { type: 'css' };
import './goal-cube.component.js';
const template = document.createElement('template');
template.innerHTML = `
    <div class="goal-card">
        <div class="goal-header">
            <span class="goal-title" id="title"></span>
            <span class="goal-status-pill" id="status-pill"></span>
        </div>
        <div class="goal-description" id="description"></div>
        <div class="goal-cubes-container" id="cubes"></div>
    </div>
`;
export class GoalItem extends HTMLElement {
    static get observedAttributes() {
        return ['data-goal-id', 'data-title', 'data-description', 'data-status'];
    }
    _subGoals = [];
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        this.setupEvents();
        this.update();
    }
    set subGoals(value) {
        this._subGoals = value;
        this.renderCubes();
    }
    attributeChangedCallback(_name, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        this.update();
    }
    setupEvents() {
        this.addEventListener('click', (e) => {
            const path = e.composedPath();
            const clickedPill = path.some(el => el.classList?.contains('goal-status-pill'));
            if (!clickedPill && this.dataset.goalId) {
                this.dispatchEvent(new CustomEvent('navigate', {
                    bubbles: true,
                    composed: true,
                    detail: { id: this.dataset.goalId }
                }));
            }
        });
        this.shadowRoot.getElementById('status-pill').addEventListener('click', (e) => {
            e.stopPropagation();
            this.dispatchEvent(new CustomEvent('change-status', {
                bubbles: true,
                composed: true,
                detail: { id: this.dataset.goalId }
            }));
        });
    }
    update() {
        const shadow = this.shadowRoot;
        const card = shadow.querySelector('.goal-card');
        if (!card)
            return;
        const status = (this.dataset.status ?? 'active').toLowerCase();
        card.classList.forEach(cls => {
            if (cls.startsWith('status-'))
                card.classList.remove(cls);
        });
        card.classList.add(`status-${status}`);
        shadow.getElementById('title').textContent = this.dataset.title ?? '';
        shadow.getElementById('title').style.viewTransitionName = `title-${this.dataset.goalId}`;
        shadow.getElementById('status-pill').textContent = (this.dataset.status ?? '').replace('_', ' ');
        shadow.getElementById('description').textContent = this.dataset.description ?? '';
    }
    renderCubes() {
        const container = this.shadowRoot.getElementById('cubes');
        container.innerHTML = '';
        for (const sub of this._subGoals) {
            const cube = document.createElement('goal-cube');
            cube.setAttribute('status', sub.status);
            container.appendChild(cube);
        }
    }
}
customElements.define('goal-item', GoalItem);
