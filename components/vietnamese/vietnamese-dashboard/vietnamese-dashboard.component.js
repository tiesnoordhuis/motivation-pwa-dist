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
            <div class="section-row">
                <h2><span class="accent-bar"></span>Decks</h2>
                <button id="create-deck-btn" class="btn-secondary" type="button">New deck</button>
            </div>
            <div id="decks-list" class="decks-list">
                <p class="status-msg">Loading…</p>
            </div>
        </section>

        <section id="cards-section" class="cards-section" hidden>
            <div class="section-row">
                <h2><span class="accent-bar"></span><span id="cards-title-text">Cards</span></h2>
                <button id="create-card-btn" class="btn-secondary" type="button">New card</button>
            </div>
            <div class="cards-toolbar">
                <button id="close-cards-btn" class="btn-text" type="button">Back to deck list</button>
            </div>
            <div id="cards-list" class="cards-list"></div>
        </section>

        <div class="actions">
            <button id="start-review-btn" class="btn-start">Start Review Session</button>
        </div>
    </div>

    <dialog id="deck-dialog" class="form-dialog">
        <form id="deck-form" method="dialog" novalidate>
            <h3 id="deck-dialog-title">New deck</h3>
            <label for="deck-name">Name</label>
            <input id="deck-name" name="name" type="text" maxlength="120" required>
            <p id="deck-name-error" class="inline-error" hidden></p>

            <label for="deck-description">Description (optional)</label>
            <textarea id="deck-description" name="description" rows="3" maxlength="500"></textarea>

            <div class="dialog-actions">
                <button type="button" data-action="cancel-deck">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    </dialog>

    <dialog id="card-dialog" class="form-dialog">
        <form id="card-form" method="dialog" novalidate>
            <h3 id="card-dialog-title">New card</h3>
            <label for="card-front">Front</label>
            <input id="card-front" name="front" type="text" maxlength="300" required>
            <p id="card-front-error" class="inline-error" hidden></p>

            <label for="card-back">Back</label>
            <input id="card-back" name="back" type="text" maxlength="300" required>
            <p id="card-back-error" class="inline-error" hidden></p>

            <label for="card-notes">Notes (optional)</label>
            <textarea id="card-notes" name="notes" rows="3" maxlength="1000"></textarea>

            <div class="dialog-actions">
                <button type="button" data-action="cancel-card">Cancel</button>
                <button type="submit" class="btn-primary">Save</button>
            </div>
        </form>
    </dialog>

    <dialog id="confirm-dialog" class="form-dialog">
        <form method="dialog" id="confirm-form">
            <h3>Confirm deletion</h3>
            <p id="confirm-message"></p>
            <div class="dialog-actions">
                <button type="button" data-action="cancel-confirm">Cancel</button>
                <button type="button" data-action="confirm-delete" class="btn-danger">Delete</button>
            </div>
        </form>
    </dialog>
`;
function renderStatusMessage(message, isError = false) {
    const p = document.createElement('p');
    p.className = isError ? 'status-msg error' : 'status-msg';
    p.textContent = message;
    return p;
}
function normalizeOptional(value) {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
}
export class VietnameseDashboard extends HTMLElement {
    decks = [];
    cards = [];
    selectedDeckId = null;
    editingDeckId = null;
    editingCardId = null;
    pendingDelete = null;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        const shadow = this.shadowRoot;
        shadow.getElementById('start-review-btn').addEventListener('click', () => navigate('#/vietnamese/review'));
        shadow.getElementById('create-deck-btn').addEventListener('click', () => this.openDeckDialog());
        shadow.getElementById('create-card-btn').addEventListener('click', () => this.openCardDialog());
        shadow.getElementById('close-cards-btn').addEventListener('click', () => this.closeCardsView());
        const deckForm = shadow.getElementById('deck-form');
        const cardForm = shadow.getElementById('card-form');
        deckForm.addEventListener('submit', (event) => {
            event.preventDefault();
            void this.saveDeck();
        });
        cardForm.addEventListener('submit', (event) => {
            event.preventDefault();
            void this.saveCard();
        });
        shadow.addEventListener('click', (event) => {
            const target = event.target;
            const actionButton = target.closest('button[data-action]');
            if (!actionButton) {
                return;
            }
            const action = actionButton.dataset.action;
            if (!action) {
                return;
            }
            switch (action) {
                case 'edit-deck': {
                    const deckId = actionButton.dataset.deckId;
                    if (!deckId)
                        return;
                    const deck = this.decks.find((item) => item.id === deckId);
                    if (!deck)
                        return;
                    this.openDeckDialog(deck);
                    return;
                }
                case 'delete-deck': {
                    const deckId = actionButton.dataset.deckId;
                    const deckName = actionButton.dataset.deckName;
                    if (!deckId || !deckName)
                        return;
                    this.openDeleteDialog({ kind: 'deck', id: deckId, label: deckName });
                    return;
                }
                case 'open-cards': {
                    const deckId = actionButton.dataset.deckId;
                    if (!deckId)
                        return;
                    void this.openCardsView(deckId);
                    return;
                }
                case 'edit-card': {
                    const cardId = actionButton.dataset.cardId;
                    if (!cardId)
                        return;
                    const card = this.cards.find((item) => item.id === cardId);
                    if (!card)
                        return;
                    this.openCardDialog(card);
                    return;
                }
                case 'delete-card': {
                    const cardId = actionButton.dataset.cardId;
                    const front = actionButton.dataset.cardFront;
                    if (!cardId || !front)
                        return;
                    this.openDeleteDialog({ kind: 'card', id: cardId, label: front });
                    return;
                }
                case 'cancel-deck': {
                    shadow.getElementById('deck-dialog').close();
                    return;
                }
                case 'cancel-card': {
                    shadow.getElementById('card-dialog').close();
                    return;
                }
                case 'cancel-confirm': {
                    shadow.getElementById('confirm-dialog').close();
                    this.pendingDelete = null;
                    return;
                }
                case 'confirm-delete': {
                    void this.confirmDelete();
                    return;
                }
                default:
                    return;
            }
        });
        void this.loadDecks();
    }
    async loadDecks() {
        const list = this.shadowRoot.getElementById('decks-list');
        list.replaceChildren(renderStatusMessage('Loading…'));
        try {
            const decks = await VietnameseService.getDeckStats();
            this.decks = decks;
            if (decks.length === 0) {
                list.replaceChildren(renderStatusMessage('No decks yet.'));
                this.closeCardsView();
                return;
            }
            const rows = decks.map((deck) => this.createDeckRow(deck));
            list.replaceChildren(...rows);
            this.refreshCardsSectionTitle();
        }
        catch {
            list.replaceChildren(renderStatusMessage('Could not load decks.', true));
        }
    }
    createDeckRow(deck) {
        const row = document.createElement('article');
        row.className = 'deck-row';
        const card = document.createElement('deck-card');
        card.dataset.deck = JSON.stringify(deck);
        const actions = document.createElement('div');
        actions.className = 'item-actions';
        const openBtn = document.createElement('button');
        openBtn.type = 'button';
        openBtn.className = 'btn-text';
        openBtn.dataset.action = 'open-cards';
        openBtn.dataset.deckId = deck.id;
        openBtn.textContent = 'Manage cards';
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn-text';
        editBtn.dataset.action = 'edit-deck';
        editBtn.dataset.deckId = deck.id;
        editBtn.textContent = 'Edit';
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn-text danger';
        deleteBtn.dataset.action = 'delete-deck';
        deleteBtn.dataset.deckId = deck.id;
        deleteBtn.dataset.deckName = deck.name;
        deleteBtn.textContent = 'Delete';
        actions.append(openBtn, editBtn, deleteBtn);
        row.append(card, actions);
        return row;
    }
    async openCardsView(deckId) {
        this.selectedDeckId = deckId;
        const cardsSection = this.shadowRoot.getElementById('cards-section');
        cardsSection.hidden = false;
        this.refreshCardsSectionTitle();
        await this.loadCards();
    }
    closeCardsView() {
        this.selectedDeckId = null;
        const cardsSection = this.shadowRoot.getElementById('cards-section');
        cardsSection.hidden = true;
        const cardsList = this.shadowRoot.getElementById('cards-list');
        cardsList.replaceChildren();
    }
    refreshCardsSectionTitle() {
        const titleEl = this.shadowRoot.getElementById('cards-title-text');
        if (!this.selectedDeckId) {
            titleEl.textContent = 'Cards';
            return;
        }
        const deck = this.decks.find((item) => item.id === this.selectedDeckId);
        if (!deck) {
            titleEl.textContent = 'Cards';
            return;
        }
        titleEl.textContent = `Cards — ${deck.name}`;
    }
    async loadCards() {
        const cardsList = this.shadowRoot.getElementById('cards-list');
        if (!this.selectedDeckId) {
            cardsList.replaceChildren();
            return;
        }
        cardsList.replaceChildren(renderStatusMessage('Loading cards…'));
        try {
            const cards = await VietnameseService.getCardsByDeck(this.selectedDeckId);
            this.cards = cards;
            if (cards.length === 0) {
                cardsList.replaceChildren(renderStatusMessage('No cards in this deck yet.'));
                return;
            }
            cardsList.replaceChildren(...cards.map((card) => this.createCardRow(card)));
        }
        catch {
            cardsList.replaceChildren(renderStatusMessage('Could not load cards.', true));
        }
    }
    createCardRow(card) {
        const row = document.createElement('article');
        row.className = 'card-row';
        const content = document.createElement('div');
        content.className = 'card-content';
        const front = document.createElement('p');
        front.className = 'card-front';
        front.textContent = card.front;
        const back = document.createElement('p');
        back.className = 'card-back';
        back.textContent = card.back;
        const notes = document.createElement('p');
        notes.className = 'card-notes';
        notes.hidden = !card.notes;
        notes.textContent = card.notes ?? '';
        content.append(front, back, notes);
        const actions = document.createElement('div');
        actions.className = 'item-actions';
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'btn-text';
        editBtn.dataset.action = 'edit-card';
        editBtn.dataset.cardId = card.id;
        editBtn.textContent = 'Edit';
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn-text danger';
        deleteBtn.dataset.action = 'delete-card';
        deleteBtn.dataset.cardId = card.id;
        deleteBtn.dataset.cardFront = card.front;
        deleteBtn.textContent = 'Delete';
        actions.append(editBtn, deleteBtn);
        row.append(content, actions);
        return row;
    }
    openDeckDialog(deck) {
        const shadow = this.shadowRoot;
        this.clearDeckErrors();
        const dialog = shadow.getElementById('deck-dialog');
        const title = shadow.getElementById('deck-dialog-title');
        const nameInput = shadow.getElementById('deck-name');
        const descriptionInput = shadow.getElementById('deck-description');
        this.editingDeckId = deck?.id ?? null;
        title.textContent = deck ? 'Edit deck' : 'New deck';
        nameInput.value = deck?.name ?? '';
        descriptionInput.value = deck?.description ?? '';
        dialog.showModal();
    }
    openCardDialog(card) {
        if (!this.selectedDeckId) {
            return;
        }
        const shadow = this.shadowRoot;
        this.clearCardErrors();
        const dialog = shadow.getElementById('card-dialog');
        const title = shadow.getElementById('card-dialog-title');
        const frontInput = shadow.getElementById('card-front');
        const backInput = shadow.getElementById('card-back');
        const notesInput = shadow.getElementById('card-notes');
        this.editingCardId = card?.id ?? null;
        title.textContent = card ? 'Edit card' : 'New card';
        frontInput.value = card?.front ?? '';
        backInput.value = card?.back ?? '';
        notesInput.value = card?.notes ?? '';
        dialog.showModal();
    }
    clearDeckErrors() {
        const errorEl = this.shadowRoot.getElementById('deck-name-error');
        errorEl.hidden = true;
        errorEl.textContent = '';
    }
    clearCardErrors() {
        const frontError = this.shadowRoot.getElementById('card-front-error');
        const backError = this.shadowRoot.getElementById('card-back-error');
        frontError.hidden = true;
        backError.hidden = true;
        frontError.textContent = '';
        backError.textContent = '';
    }
    async saveDeck() {
        const shadow = this.shadowRoot;
        const dialog = shadow.getElementById('deck-dialog');
        const nameInput = shadow.getElementById('deck-name');
        const descriptionInput = shadow.getElementById('deck-description');
        const nameError = shadow.getElementById('deck-name-error');
        this.clearDeckErrors();
        const name = nameInput.value.trim();
        if (!name) {
            nameError.textContent = 'Name is required.';
            nameError.hidden = false;
            return;
        }
        const payload = {
            name,
            description: normalizeOptional(descriptionInput.value),
        };
        try {
            if (this.editingDeckId) {
                await VietnameseService.updateDeck(this.editingDeckId, payload);
            }
            else {
                await VietnameseService.createDeck(payload);
            }
            dialog.close();
            await this.loadDecks();
            if (this.selectedDeckId) {
                await this.loadCards();
            }
        }
        catch (error) {
            nameError.textContent = error instanceof Error ? error.message : 'Failed to save deck.';
            nameError.hidden = false;
        }
    }
    async saveCard() {
        if (!this.selectedDeckId) {
            return;
        }
        const shadow = this.shadowRoot;
        const dialog = shadow.getElementById('card-dialog');
        const frontInput = shadow.getElementById('card-front');
        const backInput = shadow.getElementById('card-back');
        const notesInput = shadow.getElementById('card-notes');
        const frontError = shadow.getElementById('card-front-error');
        const backError = shadow.getElementById('card-back-error');
        this.clearCardErrors();
        const front = frontInput.value.trim();
        const back = backInput.value.trim();
        let hasError = false;
        if (!front) {
            frontError.textContent = 'Front is required.';
            frontError.hidden = false;
            hasError = true;
        }
        if (!back) {
            backError.textContent = 'Back is required.';
            backError.hidden = false;
            hasError = true;
        }
        if (hasError) {
            return;
        }
        const payload = {
            front,
            back,
            notes: normalizeOptional(notesInput.value),
        };
        try {
            if (this.editingCardId) {
                await VietnameseService.updateCard(this.editingCardId, payload);
            }
            else {
                await VietnameseService.createCard(this.selectedDeckId, payload);
            }
            dialog.close();
            await this.loadCards();
            await this.loadDecks();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save card.';
            frontError.textContent = message;
            frontError.hidden = false;
        }
    }
    openDeleteDialog(payload) {
        this.pendingDelete = payload;
        const dialog = this.shadowRoot.getElementById('confirm-dialog');
        const message = this.shadowRoot.getElementById('confirm-message');
        if (payload.kind === 'deck') {
            message.textContent = `Delete deck "${payload.label}" and all its cards/reviews?`;
        }
        else {
            message.textContent = `Delete card "${payload.label}"?`;
        }
        dialog.showModal();
    }
    async confirmDelete() {
        if (!this.pendingDelete) {
            return;
        }
        const pending = this.pendingDelete;
        const dialog = this.shadowRoot.getElementById('confirm-dialog');
        try {
            if (pending.kind === 'deck') {
                await VietnameseService.deleteDeck(pending.id);
                if (this.selectedDeckId === pending.id) {
                    this.closeCardsView();
                }
            }
            else {
                await VietnameseService.deleteCard(pending.id);
                await this.loadCards();
            }
            await this.loadDecks();
            if (this.selectedDeckId) {
                await this.loadCards();
            }
            dialog.close();
        }
        finally {
            this.pendingDelete = null;
        }
    }
}
customElements.define('vietnamese-dashboard', VietnameseDashboard);
