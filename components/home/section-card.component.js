import styles from './section-card.css' with { type: 'css' };
const template = document.createElement('template');
template.innerHTML = `
    <div class="section-card">
        <div class="card-header">
            <span class="card-icon" id="icon"></span>
            <h2 class="card-title" id="title"></h2>
        </div>
        <p class="card-summary" id="summary"></p>
    </div>
`;
export class SectionCard extends HTMLElement {
    static get observedAttributes() {
        return ['icon', 'title', 'summary', 'color', 'route'];
    }
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        this.update();
        this.addEventListener('click', () => {
            const route = this.getAttribute('route');
            if (route) {
                // Set view-transition-name on the card for the grow animation
                const card = this.shadowRoot.querySelector('.section-card');
                if (card) {
                    card.style.viewTransitionName = `section-${this.getAttribute('color')}`;
                }
                this.dispatchEvent(new CustomEvent('section-navigate', {
                    bubbles: true,
                    composed: true,
                    detail: { route }
                }));
            }
        });
    }
    attributeChangedCallback(_name, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        this.update();
    }
    update() {
        const shadow = this.shadowRoot;
        shadow.getElementById('icon').textContent = this.getAttribute('icon') ?? '';
        shadow.getElementById('title').textContent = this.getAttribute('title') ?? '';
        shadow.getElementById('summary').textContent = this.getAttribute('summary') ?? 'Loading…';
    }
}
customElements.define('section-card', SectionCard);
