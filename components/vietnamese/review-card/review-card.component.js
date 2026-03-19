import styles from './review-card.css' with { type: 'css' };
const reviewCardTemplate = document.createElement('template');
reviewCardTemplate.innerHTML = `
    <div class="card-container">
        <div class="card-inner">
            <div class="card-face card-front" aria-live="polite">
            </div>
            <div class="card-face card-back" aria-live="polite">
            </div>
        </div>
    </div>
`;
export class ReviewCard extends HTMLElement {
    frontText = '';
    backText = '';
    flipped = false;
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [styles];
        this.render();
    }
    connectedCallback() {
        this.addEventListener('click', this.handleInteract);
        // Map dataset attributes to internal properties
        if (this.dataset.front)
            this.frontText = this.dataset.front;
        if (this.dataset.back)
            this.backText = this.dataset.back;
        this.updateContent();
    }
    disconnectedCallback() {
        this.removeEventListener('click', this.handleInteract);
    }
    static get observedAttributes() {
        return ['data-front', 'data-back'];
    }
    attributeChangedCallback(name, _oldVal, newVal) {
        if (name === 'data-front') {
            this.frontText = newVal ?? '';
            this.updateContent();
        }
        else if (name === 'data-back') {
            this.backText = newVal ?? '';
            this.updateContent();
        }
    }
    handleInteract = () => {
        if (!this.flipped) {
            this.flipped = true;
            this.renderFlippedState();
            const CustomEventCtor = this.ownerDocument.defaultView?.CustomEvent ?? CustomEvent;
            this.dispatchEvent(new CustomEventCtor('card-flipped', { bubbles: true, composed: true }));
        }
    };
    /**
     * Resets the card to the un-flipped state.
     * Useful when navigating to the next card.
     */
    resetFlip() {
        this.flipped = false;
        this.renderFlippedState();
    }
    render() {
        this.shadowRoot.appendChild(reviewCardTemplate.content.cloneNode(true));
        this.updateContent();
    }
    updateContent() {
        if (!this.shadowRoot)
            return;
        const frontEl = this.shadowRoot.querySelector('.card-front');
        const backEl = this.shadowRoot.querySelector('.card-back');
        if (frontEl)
            frontEl.textContent = this.frontText;
        if (backEl)
            backEl.textContent = this.backText;
    }
    renderFlippedState() {
        const inner = this.shadowRoot?.querySelector('.card-inner');
        if (inner) {
            if (this.flipped) {
                inner.classList.add('is-flipped');
            }
            else {
                inner.classList.remove('is-flipped');
            }
        }
    }
}
customElements.define('review-card', ReviewCard);
