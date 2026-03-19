import styles from './vietnamese-dashboard.css' with { type: 'css' };
import { navigate } from '../../../router.js';
import { VietnameseService } from '../../../services/vietnamese.service.js';
import '../deck-card/deck-card.component.js';
const template = document.createElement('template');
template.innerHTML = `
    <div class="dashboard">
        <section class="how-it-works">
            <h2><span class="accent-bar"></span>How it works</h2>
            <p>
                This system uses <strong>FSRS</strong> — an algorithm that shows each card at the
                optimal moment, just before you'd forget it. Cards you find difficult come back
                sooner; ones you know well are spaced further apart over time.
            </p>
            <ol class="review-steps">
                <li>A card is shown — try to recall the answer before looking</li>
                <li>Click the card to reveal the answer</li>
                <li>
                    Rate your recall:
                    <span class="rating-pills">
                        <span class="pill again">Again</span>
                        <span class="pill hard">Hard</span>
                        <span class="pill good">Good</span>
                        <span class="pill easy">Easy</span>
                    </span>
                </li>
                <li>The algorithm schedules the next review automatically</li>
            </ol>
        </section>

        <section class="decks-section">
            <h2><span class="accent-bar"></span>Decks</h2>
            <div id="decks-list" class="decks-list">
                <p class="status-msg">Loading…</p>
            </div>
        </section>

        <div class="actions">
            <button id="start-review-btn" class="btn-start">Start Review Session</button>
        </div>
    </div>
`;
function renderDeckCard(deck) {
    const el = document.createElement('deck-card');
    el.dataset.deck = JSON.stringify(deck);
    return el;
}
function renderStatusMessage(message, isError = false) {
    const p = document.createElement('p');
    p.className = isError ? 'status-msg error' : 'status-msg';
    p.textContent = message;
    return p;
}
export class VietnameseDashboard extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        const shadow = this.shadowRoot;
        shadow.getElementById('start-review-btn').addEventListener('click', () => navigate('#/vietnamese/review'));
        this.loadDecks();
    }
    async loadDecks() {
        const list = this.shadowRoot.getElementById('decks-list');
        try {
            const decks = await VietnameseService.getDeckStats();
            if (decks.length === 0) {
                list.replaceChildren(renderStatusMessage('No decks yet.'));
                return;
            }
            list.replaceChildren(...decks.map(renderDeckCard));
        }
        catch {
            list.replaceChildren(renderStatusMessage('Could not load decks.', true));
        }
    }
}
customElements.define('vietnamese-dashboard', VietnameseDashboard);
