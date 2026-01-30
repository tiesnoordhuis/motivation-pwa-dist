export class GoalHeaderCard extends HTMLElement {
    _goal = null;
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
        if (!this.shadowRoot?.firstChild)
            this.render();
        this.setupEvents();
    }
    setupEvents() {
        // Delegate events from shadow DOM to host
        this.shadowRoot?.addEventListener('click', (e) => {
            const target = e.target;
            if (target.closest('#back-btn')) {
                this.dispatchEvent(new CustomEvent('nav-back', { bubbles: true, composed: true }));
            }
            else if (target.closest('#edit-btn')) {
                this.dispatchEvent(new CustomEvent('edit-goal', {
                    bubbles: true,
                    composed: true,
                    detail: { goal: this._goal }
                }));
            }
            else if (target.closest('#delete-btn')) {
                this.dispatchEvent(new CustomEvent('delete-goal', {
                    bubbles: true,
                    composed: true,
                    detail: { id: this._goal?.id }
                }));
            }
        });
    }
    render() {
        const goal = this._goal;
        if (!goal) {
            // Root view state or empty
            this.shadowRoot.innerHTML = '';
            return;
        }
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin-bottom: 20px;
                }
                .header-card {
                    background: var(--bg-color, #fff);
                    color: var(--text-color, #000);
                    padding: 10px 0;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                
                .back-btn {
                    cursor: pointer;
                    background: transparent;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    color: inherit;
                    transition: background-color 0.2s;
                }
                .back-btn:hover {
                    background: rgba(0,0,0,0.1);
                }
                @media (prefers-color-scheme: dark) {
                     .back-btn:hover { background-color: rgba(255,255,255,0.1); }
                }

                .title-section {
                    flex: 1;
                    min-width: 0;
                }
                .title {
                    font-size: 1.2rem;
                    font-weight: bold;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin: 0;
                }
                .description {
                    font-size: 0.85rem;
                    opacity: 0.7;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin: 0;
                }

                .actions {
                    display: flex;
                    gap: 8px;
                }

                .icon-btn {
                    background: none;
                    border: none;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%; /* Circle */
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.2rem;
                    cursor: pointer;
                    color: inherit;
                    transition: background-color 0.2s;
                }
                .icon-btn:hover {
                    background-color: rgba(0,0,0,0.1);
                }

                @media (prefers-color-scheme: dark) {
                    .icon-btn:hover { background-color: rgba(255,255,255,0.1); }
                }
            </style>
            
            <div class="header-card">
                <button id="back-btn" class="back-btn" title="Back">
                    ←
                </button>
                
                <div class="title-section">
                    <h2 class="title" style="view-transition-name: title-${goal.id}">${goal.title}</h2>
                    <p class="description">${goal.description || ''}</p>
                </div>

                <div class="actions">
                    <button id="edit-btn" class="icon-btn" title="Edit">✎</button>
                    <button id="delete-btn" class="icon-btn" title="Delete">🗑</button>
                </div>
            </div>
        `;
    }
}
customElements.define('goal-header-card', GoalHeaderCard);
