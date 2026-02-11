import styles from './goal-cube.css' with { type: 'css' };
const template = document.createElement('template');
template.innerHTML = `
    <div class="cube" id="cube"></div>
`;
export class GoalCube extends HTMLElement {
    static get observedAttributes() {
        return ['status'];
    }
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    attributeChangedCallback(_name, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        this.update();
    }
    update() {
        const status = this.getAttribute('status') ?? 'active';
        const cube = this.shadowRoot.getElementById('cube');
        // Remove any previous status class, keep base 'cube' class
        cube.classList.forEach(cls => {
            if (cls.startsWith('status-'))
                cube.classList.remove(cls);
        });
        cube.classList.add(`status-${status.toLowerCase()}`);
        cube.title = status.replace('_', ' ');
    }
}
customElements.define('goal-cube', GoalCube);
