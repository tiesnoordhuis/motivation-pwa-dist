import './goal-cube.component.js';
export class GoalItem extends HTMLElement {
    _goal = null;
    static get observedAttributes() {
        return ['data-id'];
    }
    set goal(value) {
        this._goal = value;
        this.render();
    }
    get goal() {
        return this._goal;
    }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        this.render();
        this.setupEvents();
    }
    setupEvents() {
        this.addEventListener('click', (e) => {
            // If clicking inside the status pill (which will stop prop), we do nothing here.
            // But we need to dispatch navigate from host
            const path = e.composedPath();
            const clickedPill = path.some(el => el.classList?.contains('goal-status-pill'));
            if (!clickedPill && this._goal) {
                this.dispatchEvent(new CustomEvent('navigate', {
                    bubbles: true,
                    composed: true,
                    detail: { id: this._goal.id }
                }));
            }
        });
    }
    render() {
        if (!this._goal)
            return;
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-bottom: 1rem;
                }
                .goal-card {
                    border: 1px solid var(--card-border, #ddd);
                    border-radius: 8px;
                    padding: 1rem;
                    background: var(--card-bg, #fff);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .goal-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }
                .goal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 0.5rem;
                }
                .goal-title {
                    margin: 0;
                    font-size: 1.2rem;
                    font-weight: 600;
                    color: var(--text-color, #000);
                }
                .goal-description {
                    font-size: 0.9rem;
                    color: var(--text-color-secondary, #666);
                    margin-bottom: 0.8rem;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .goal-title {
                     view-transition-name: title-${this._goal.id};
                }

                /* Status Pill */
                .goal-status-pill {
                    display: inline-block;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    padding: 4px 8px;
                    border-radius: 12px;
                    background: #eee;
                    color: #555;
                    cursor: pointer;
                    user-select: none;
                    white-space: nowrap;
                    margin-left: 10px;
                }
                
                .status-active .goal-status-pill { background-color: #e8f8f5; color: #27ae60; }
                .status-on_hold .goal-status-pill { background-color: #fef9e7; color: #f39c12; }
                .status-completed .goal-status-pill { background-color: #ebf5fb; color: #2980b9; }
                .status-archived .goal-status-pill { background-color: #f2f4f4; color: #7f8c8d; }

                /* Cubes */
                .goal-cubes-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    margin-top: 10px;
                }

                @media (prefers-color-scheme: dark) {
                    .goal-card {
                        background: var(--card-bg, #2d2d2d);
                        border-color: var(--card-border, #444);
                    }
                    .goal-title { color: #fff; }
                    .goal-description { color: #ccc; }
                }
            </style>
            
            <div class="goal-card status-${this._goal.status.toLowerCase()}">
                <div class="goal-header">
                    <span class="goal-title">${this._goal.title}</span>
                    <span class="goal-status-pill" id="status-pill">${this._goal.status.replace('_', ' ')}</span>
                </div>
                <div class="goal-description">${this._goal.description || ''}</div>
                
                <div class="goal-cubes-container">
                    ${this.renderCubes()}
                </div>
            </div>
        `;
        // Bind pill click
        this.shadowRoot.getElementById('status-pill')?.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop it from Bubbling to card click
            this.dispatchEvent(new CustomEvent('change-status', {
                bubbles: true,
                composed: true,
                detail: { goal: this._goal }
            }));
        });
    }
    renderCubes() {
        if (!this._goal?.sub_goals || this._goal.sub_goals.length === 0)
            return '';
        return this._goal.sub_goals.map(sub => `
            <goal-cube status="${sub.status}"></goal-cube>
        `).join('');
    }
}
customElements.define('goal-item', GoalItem);
