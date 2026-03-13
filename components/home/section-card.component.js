import styles from './section-card.css' with { type: 'css' };
const template = document.createElement('template');
template.innerHTML = `
    <div class="section-card">
        <h2 class="card-title" id="title"></h2>
        <p class="card-summary" id="summary"></p>
    </div>
`;
export class SectionCard extends HTMLElement {
    static get observedAttributes() {
        return ['title', 'summary', 'color', 'route'];
    }
    handleClick = () => {
        const route = this.getAttribute('route');
        if (!route)
            return;
        window.location.hash = route;
    };
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        this.update();
        this.addEventListener('click', this.handleClick);
    }
    disconnectedCallback() {
        this.removeEventListener('click', this.handleClick);
    }
    attributeChangedCallback(_name, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        this.update();
    }
    update() {
        const shadow = this.shadowRoot;
        shadow.getElementById('title').textContent = this.getAttribute('title') ?? '';
        shadow.getElementById('summary').textContent = this.getAttribute('summary') ?? 'Loading…';
    }
}
customElements.define('section-card', SectionCard);
