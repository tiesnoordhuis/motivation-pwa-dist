import styles from './review-session.css' with { type: 'css' };
import { VietnameseService } from '../../../services/vietnamese.service.js';
import '../review-card/review-card.component.js';
import '../review-session-summary/review-session-summary.component.js';
const template = document.createElement('template');
template.innerHTML = `
    <div class="session-layout">
        <header class="session-header">
            <div class="progress" id="progress"></div>
        </header>
        
        <main class="card-area" id="card-container">
            <review-card id="active-card"></review-card>
        </main>
        
        <footer class="controls" id="controls" hidden>
            <button data-rating="1" class="btn-rating btn-again">
                <span class="label">Again</span>
                <span class="hint">(1)</span>
            </button>
            <button data-rating="2" class="btn-rating btn-hard">
                <span class="label">Hard</span>
                <span class="hint">(2)</span>
            </button>
            <button data-rating="3" class="btn-rating btn-good">
                <span class="label">Good</span>
                <span class="hint">(3)</span>
            </button>
            <button data-rating="4" class="btn-rating btn-easy">
                <span class="label">Easy</span>
                <span class="hint">(4)</span>
            </button>
        </footer>
    </div>
`;
export class ReviewSession extends HTMLElement {
    queue = [];
    currentIndex = 0;
    isWaitingForRating = false;
    totalReviewed = 0;
    ratingsSum = 0;
    controlsContainer;
    progressEl;
    reviewCardEl = null;
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.adoptedStyleSheets = [styles];
        this.showLoading();
    }
    connectedCallback() {
        void this.startSession();
        this.addEventListener('card-flipped', this.handleCardFlipped);
        this.shadowRoot.addEventListener('click', this.handleButtonClick);
    }
    disconnectedCallback() {
        this.removeEventListener('card-flipped', this.handleCardFlipped);
        this.shadowRoot.removeEventListener('click', this.handleButtonClick);
    }
    async startSession() {
        this.resetState();
        try {
            this.showLoading();
            this.queue = await VietnameseService.getDueReviewCards(20);
            if (this.queue.length === 0) {
                this.showSummary();
            }
            else {
                this.renderSession();
                this.updateCard();
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load review session';
            this.showError(message);
        }
    }
    handleCardFlipped = () => {
        this.isWaitingForRating = true;
        this.controlsContainer.hidden = false;
    };
    handleButtonClick = async (e) => {
        const target = e.target;
        const button = target.closest('button[data-rating]');
        if (!button || !this.isWaitingForRating)
            return;
        const ratingStr = button.getAttribute('data-rating');
        if (!ratingStr)
            return;
        const rating = parseInt(ratingStr, 10);
        const currentCard = this.queue[this.currentIndex];
        this.isWaitingForRating = false;
        this.controlsContainer.hidden = true;
        button.classList.add('loading');
        try {
            await VietnameseService.submitReview(currentCard.id, rating);
            this.totalReviewed++;
            this.ratingsSum += rating;
            this.currentIndex++;
            if (this.currentIndex >= this.queue.length) {
                this.showSummary();
            }
            else {
                this.updateCard();
            }
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.progressEl.textContent = `Sync failed: ${message}`;
            this.isWaitingForRating = true;
            this.controlsContainer.hidden = false;
        }
        finally {
            button.classList.remove('loading');
        }
    };
    resetState() {
        this.queue = [];
        this.currentIndex = 0;
        this.isWaitingForRating = false;
        this.totalReviewed = 0;
        this.ratingsSum = 0;
        this.controlsContainer = undefined;
        this.progressEl = undefined;
        this.reviewCardEl = null;
    }
    showLoading() {
        const infoDiv = document.createElement('div');
        infoDiv.textContent = 'Loading vocabulary...';
        infoDiv.className = 'info-message';
        this.shadowRoot.replaceChildren(infoDiv);
    }
    showError(msg) {
        const infoDiv = document.createElement('div');
        infoDiv.textContent = msg;
        infoDiv.className = 'error-message';
        this.shadowRoot.replaceChildren(infoDiv);
    }
    renderSession() {
        this.shadowRoot.replaceChildren(template.content.cloneNode(true));
        this.controlsContainer = this.shadowRoot.getElementById('controls');
        this.progressEl = this.shadowRoot.getElementById('progress');
        this.reviewCardEl = this.shadowRoot.getElementById('active-card');
    }
    updateCard() {
        const card = this.queue[this.currentIndex];
        const remaining = this.queue.length - this.currentIndex;
        this.progressEl.textContent = `${remaining} card${remaining !== 1 ? 's' : ''} remaining`;
        this.isWaitingForRating = false;
        this.controlsContainer.hidden = true;
        if (this.reviewCardEl) {
            this.reviewCardEl.style.visibility = 'hidden';
            this.reviewCardEl.style.opacity = '0';
            this.reviewCardEl.style.transform = 'translateY(10px)';
            this.reviewCardEl.resetFlip();
            this.reviewCardEl.dataset.front = card.front;
            this.reviewCardEl.dataset.back = card.back;
            const scheduleFrame = window.requestAnimationFrame ?? ((callback) => {
                callback(0);
                return 0;
            });
            scheduleFrame(() => {
                this.reviewCardEl.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                this.reviewCardEl.style.visibility = 'visible';
                this.reviewCardEl.style.opacity = '1';
                this.reviewCardEl.style.transform = 'translateY(0)';
            });
        }
    }
    showSummary() {
        const summaryEl = document.createElement('review-session-summary');
        summaryEl.dataset.reviewed = this.totalReviewed.toString();
        const average = this.totalReviewed === 0 ? 0 : this.ratingsSum / this.totalReviewed;
        summaryEl.dataset.average = average.toFixed(1);
        this.shadowRoot.replaceChildren(summaryEl);
    }
}
customElements.define('review-session', ReviewSession);
