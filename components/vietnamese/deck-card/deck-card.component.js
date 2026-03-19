import styles from './deck-card.css' with { type: 'css' };
const template = document.createElement('template');
template.innerHTML = `
    <div class="deck-card">
        <div class="deck-info">
            <h3 class="deck-name" id="deck-name"></h3>
            <p class="deck-description" id="deck-description" hidden></p>
        </div>
        <div class="deck-meta">
            <span class="deck-total" id="deck-total"></span>
            <span class="deck-status" id="deck-status"></span>
        </div>
    </div>
`;
export class DeckCard extends HTMLElement {
    static observedAttributes = ['data-deck'];
    deckCardEl;
    nameEl;
    descriptionEl;
    totalEl;
    statusEl;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
        this.deckCardEl = shadow.querySelector('.deck-card');
        this.nameEl = shadow.getElementById('deck-name');
        this.descriptionEl = shadow.getElementById('deck-description');
        this.totalEl = shadow.getElementById('deck-total');
        this.statusEl = shadow.getElementById('deck-status');
    }
    attributeChangedCallback() {
        this.render();
    }
    connectedCallback() {
        this.render();
    }
    set deck(stat) {
        this.dataset.deck = JSON.stringify(stat);
    }
    render() {
        const raw = this.dataset.deck;
        if (!raw)
            return;
        let stat;
        try {
            stat = JSON.parse(raw);
        }
        catch {
            return;
        }
        // Status classification
        let statusClass;
        let statusLabel;
        let hostState;
        if (stat.due_cards > 0) {
            statusClass = 'has-due';
            statusLabel = `${stat.due_cards} due`;
            hostState = 'state-due';
        }
        else if (stat.new_cards > 0) {
            statusClass = 'has-new';
            statusLabel = `${stat.new_cards} new`;
            hostState = 'state-new';
        }
        else {
            statusClass = 'up-to-date';
            statusLabel = 'all caught up';
            hostState = '';
        }
        this.dataset.state = hostState;
        this.deckCardEl.className = `deck-card ${hostState}`.trim();
        this.nameEl.textContent = stat.name;
        this.totalEl.textContent = `${stat.total_cards} card${stat.total_cards !== 1 ? 's' : ''}`;
        if (stat.description) {
            this.descriptionEl.hidden = false;
            this.descriptionEl.textContent = stat.description;
        }
        else {
            this.descriptionEl.hidden = true;
            this.descriptionEl.textContent = '';
        }
        this.statusEl.className = `deck-status ${statusClass}`;
        this.statusEl.textContent = statusLabel;
    }
}
customElements.define('deck-card', DeckCard);
