export class GoalCube extends HTMLElement {
    static get observedAttributes() {
        return ['status'];
    }
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }
    connectedCallback() {
        this.render();
    }
    attributeChangedCallback() {
        this.render();
    }
    render() {
        const status = this.getAttribute('status') || 'active';
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }
                .cube {
                    width: 12px;
                    height: 12px;
                    border-radius: 2px; /* Slight rounding for square look */
                    background-color: #ddd;
                    border: 1px solid rgba(0, 0, 0, 0.1);
                }
                .status-active { background-color: #3498db; }
                .status-completed { background-color: #2ecc71; }
                .status-on_hold { background-color: #f1c40f; }
                .status-archived { background-color: #95a5a6; }
                
                @media (prefers-color-scheme: dark) {
                     .cube { border-color: rgba(255,255,255,0.1); }
                     /* Dark mode adjustments if needed, though these colors usually work ok */
                }
            </style>
            <div class="cube status-${status.toLowerCase()}" title="${status.replace('_', ' ')}"></div>
        `;
    }
}
customElements.define('goal-cube', GoalCube);
