import styles from './goal-header-card.css' with { type: 'css' };
const template = document.createElement('template');
template.innerHTML = `
    <div class="header-card" id="card">
        <button id="back-btn" class="back-btn" title="Back">←</button>
        <div class="title-section">
            <h2 class="title" id="title"></h2>
            <p class="description" id="description"></p>
        </div>
        <div class="actions">
            <button id="edit-btn" class="icon-btn" title="Edit">✎</button>
            <button id="delete-btn" class="icon-btn" title="Delete">🗑</button>
        </div>
    </div>
`;
export class GoalHeaderCard extends HTMLElement {
    static get observedAttributes() {
        return ['data-goal-id', 'data-title', 'data-description'];
    }
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
    attributeChangedCallback(_name, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        this.update();
    }
    setupEvents() {
        this.shadowRoot.addEventListener('click', (e) => {
            const target = e.target;
            if (target.closest('#back-btn')) {
                this.dispatchEvent(new CustomEvent('nav-back', { bubbles: true, composed: true }));
            }
            else if (target.closest('#edit-btn')) {
                this.dispatchEvent(new CustomEvent('edit-goal', {
                    bubbles: true,
                    composed: true,
                    detail: { id: this.dataset.goalId }
                }));
            }
            else if (target.closest('#delete-btn')) {
                this.dispatchEvent(new CustomEvent('delete-goal', {
                    bubbles: true,
                    composed: true,
                    detail: { id: this.dataset.goalId }
                }));
            }
        });
    }
    update() {
        const shadow = this.shadowRoot;
        const card = shadow.getElementById('card');
        if (!card)
            return;
        if (!this.dataset.goalId) {
            card.style.display = 'none';
            return;
        }
        card.style.display = '';
        shadow.getElementById('title').textContent = this.dataset.title ?? '';
        shadow.getElementById('title').style.viewTransitionName = `title-${this.dataset.goalId}`;
        shadow.getElementById('description').textContent = this.dataset.description ?? '';
    }
}
customElements.define('goal-header-card', GoalHeaderCard);
