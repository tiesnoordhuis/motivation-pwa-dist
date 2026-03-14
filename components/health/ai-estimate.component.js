import styles from './ai-estimate.css' with { type: 'css' };
const template = document.createElement('template');
template.innerHTML = `
    <div class="ai-estimate-container">
        <!-- Input view -->
        <div id="input-view" class="input-section">
            <h3>Describe your meal</h3>
            <textarea id="description" class="description-input"
                placeholder="e.g. 2 scrambled eggs with toast and butter, a glass of orange juice"></textarea>

            <div class="photo-section">
                <span class="photo-label">Optional: add a photo for better accuracy</span>
                <div class="photo-row">
                    <button id="btn-photo" class="btn-photo">📷 Add Photo</button>
                    <input type="file" id="photo-input" class="photo-input" accept="image/*" capture="environment">
                    <img id="photo-preview" class="photo-preview" alt="Preview">
                    <button id="btn-remove-photo" class="btn-remove-photo" title="Remove photo">✕</button>
                </div>
            </div>

            <button id="btn-estimate" class="btn-estimate">✨ Estimate Nutrition</button>
        </div>

        <!-- Loading view -->
        <div id="loading-view" class="loading-view">
            <div class="loading-spinner"></div>
            <div class="loading-text" id="loading-text">Analyzing your meal…</div>
        </div>

        <!-- Result view -->
        <div id="result-view" class="result-view">
            <div class="result-header">
                <div class="ai-badge">🤖 AI Estimate</div>
                <span id="confidence-badge" class="confidence-badge"></span>
            </div>

            <input type="text" id="food-name" class="food-name-input">

            <div class="macro-grid">
                <div class="macro-item">
                    <input type="number" id="macro-cal" class="macro-input" min="0">
                    <span class="macro-label">kcal</span>
                </div>
                <div class="macro-item">
                    <input type="number" id="macro-protein" class="macro-input" min="0">
                    <span class="macro-label">protein</span>
                </div>
                <div class="macro-item">
                    <input type="number" id="macro-carbs" class="macro-input" min="0">
                    <span class="macro-label">carbs</span>
                </div>
                <div class="macro-item">
                    <input type="number" id="macro-fat" class="macro-input" min="0">
                    <span class="macro-label">fat</span>
                </div>
            </div>

            <div class="extra-macros">
                <div class="extra-macro-item">
                    <span class="extra-macro-label">Fiber (g)</span>
                    <input type="number" id="macro-fiber" class="extra-macro-input" min="0">
                </div>
                <div class="extra-macro-item">
                    <span class="extra-macro-label">Sugar (g)</span>
                    <input type="number" id="macro-sugar" class="extra-macro-input" min="0">
                </div>
            </div>

            <div id="notes-text" class="notes-text"></div>

            <div class="form-row">
                <div class="form-group">
                    <label for="meal-type">Meal</label>
                    <select id="meal-type" class="form-select">
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snacks">Snacks</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="log-date">Date</label>
                    <input type="date" id="log-date" class="form-date">
                </div>
            </div>

            <div class="action-buttons">
                <button id="btn-retry" class="btn-retry">↻ Re-estimate</button>
                <button id="btn-save" class="btn-save">Save to Log</button>
            </div>
        </div>

        <!-- Error view -->
        <div id="error-view" class="error-view">
            <p>⚠️</p>
            <p id="error-text"></p>
            <button id="btn-error-back" class="btn-back">Try Again</button>
        </div>
    </div>
`;
export class AiEstimate extends HTMLElement {
    _imageBase64 = null;
    _model = '';
    _onLog = null;
    _onEstimate = null;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        const shadow = this.shadowRoot;
        // Photo handling
        shadow.getElementById('btn-photo').addEventListener('click', () => {
            shadow.getElementById('photo-input').click();
        });
        shadow.getElementById('photo-input').addEventListener('change', (e) => {
            const input = e.target;
            if (input.files?.[0]) {
                this.loadImage(input.files[0]);
            }
        });
        shadow.getElementById('btn-remove-photo').addEventListener('click', () => {
            this.clearImage();
        });
        // Estimate button
        shadow.getElementById('btn-estimate').addEventListener('click', () => {
            this.doEstimate();
        });
        // Retry button
        shadow.getElementById('btn-retry').addEventListener('click', () => {
            this.showInputView();
        });
        // Save button
        shadow.getElementById('btn-save').addEventListener('click', () => {
            this.doSave();
        });
        // Error back button
        shadow.getElementById('btn-error-back').addEventListener('click', () => {
            this.showInputView();
        });
        // Set default date & meal type
        const dateInput = shadow.getElementById('log-date');
        dateInput.value = new Date().toISOString().split('T')[0];
        this.setDefaultMealType();
    }
    set onLog(handler) {
        this._onLog = handler;
    }
    set onEstimate(handler) {
        this._onEstimate = handler;
    }
    async loadImage(file) {
        const shadow = this.shadowRoot;
        // Resize to max 1024px to keep payload reasonable
        const bitmap = await createImageBitmap(file);
        const maxSize = 1024;
        let width = bitmap.width;
        let height = bitmap.height;
        if (width > maxSize || height > maxSize) {
            const scale = maxSize / Math.max(width, height);
            width = Math.round(width * scale);
            height = Math.round(height * scale);
        }
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0, width, height);
        const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
        const buffer = await blob.arrayBuffer();
        this._imageBase64 = btoa(new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        // Show preview
        const preview = shadow.getElementById('photo-preview');
        preview.src = URL.createObjectURL(blob);
        preview.style.display = '';
        shadow.getElementById('btn-remove-photo').style.display = '';
    }
    clearImage() {
        const shadow = this.shadowRoot;
        this._imageBase64 = null;
        const preview = shadow.getElementById('photo-preview');
        if (preview.src)
            URL.revokeObjectURL(preview.src);
        preview.style.display = 'none';
        preview.src = '';
        shadow.getElementById('btn-remove-photo').style.display = 'none';
        shadow.getElementById('photo-input').value = '';
    }
    showInputView() {
        const shadow = this.shadowRoot;
        shadow.getElementById('input-view').style.display = '';
        shadow.getElementById('loading-view').style.display = 'none';
        shadow.getElementById('result-view').style.display = 'none';
        shadow.getElementById('error-view').style.display = 'none';
    }
    async doEstimate() {
        const shadow = this.shadowRoot;
        const description = shadow.getElementById('description').value.trim();
        if (!description && !this._imageBase64) {
            shadow.getElementById('description').focus();
            return;
        }
        // Show loading
        shadow.getElementById('input-view').style.display = 'none';
        shadow.getElementById('loading-view').style.display = '';
        const loadingText = shadow.getElementById('loading-text');
        loadingText.textContent = 'Analyzing your meal…';
        // Update loading message after a few seconds (cold start)
        const slowTimer = setTimeout(() => {
            loadingText.textContent = 'Starting AI engine… this may take a moment';
        }, 5000);
        try {
            if (!this._onEstimate)
                throw new Error('Estimate handler not set');
            const result = await this._onEstimate(description || 'meal in photo', this._imageBase64 ?? undefined);
            clearTimeout(slowTimer);
            this._model = result.model;
            this.showResult(result.estimate);
        }
        catch (err) {
            clearTimeout(slowTimer);
            const message = err instanceof Error ? err.message : 'Unknown error';
            this.showError(message);
        }
    }
    showResult(estimate) {
        const shadow = this.shadowRoot;
        shadow.getElementById('loading-view').style.display = 'none';
        shadow.getElementById('result-view').style.display = 'flex';
        // Food name
        shadow.getElementById('food-name').value = estimate.food_name;
        // Main macros
        shadow.getElementById('macro-cal').value = String(estimate.calories);
        shadow.getElementById('macro-protein').value = String(estimate.protein_g);
        shadow.getElementById('macro-carbs').value = String(estimate.carbs_g);
        shadow.getElementById('macro-fat').value = String(estimate.fat_g);
        // Extra macros
        shadow.getElementById('macro-fiber').value = String(estimate.fiber_g);
        shadow.getElementById('macro-sugar').value = String(estimate.sugar_g);
        // Confidence badge
        const badge = shadow.getElementById('confidence-badge');
        badge.textContent = estimate.confidence;
        badge.className = `confidence-badge confidence-${estimate.confidence}`;
        // Notes
        const notes = shadow.getElementById('notes-text');
        notes.textContent = estimate.notes || '';
        notes.style.display = estimate.notes ? '' : 'none';
    }
    showError(message) {
        const shadow = this.shadowRoot;
        shadow.getElementById('loading-view').style.display = 'none';
        shadow.getElementById('error-view').style.display = '';
        shadow.getElementById('error-text').textContent = message;
    }
    doSave() {
        if (!this._onLog)
            return;
        const shadow = this.shadowRoot;
        const food_name = shadow.getElementById('food-name').value.trim();
        const meal_type = shadow.getElementById('meal-type').value;
        const date = shadow.getElementById('log-date').value;
        const calories = parseInt(shadow.getElementById('macro-cal').value, 10) || 0;
        const protein_g = parseInt(shadow.getElementById('macro-protein').value, 10) || 0;
        const carbs_g = parseInt(shadow.getElementById('macro-carbs').value, 10) || 0;
        const fat_g = parseInt(shadow.getElementById('macro-fat').value, 10) || 0;
        const fiber_g = parseInt(shadow.getElementById('macro-fiber').value, 10) || 0;
        const sugar_g = parseInt(shadow.getElementById('macro-sugar').value, 10) || 0;
        if (!food_name)
            return;
        this._onLog({
            food_name,
            meal_type,
            date,
            calories,
            protein_g,
            carbs_g,
            fat_g,
            fiber_g,
            sugar_g,
            source: 'ai_estimate',
            source_ref: this._model,
        });
    }
    /** Reset to initial input state */
    reset() {
        this.showInputView();
        const shadow = this.shadowRoot;
        shadow.getElementById('description').value = '';
        this.clearImage();
        this.setDefaultMealType();
        shadow.getElementById('log-date').value = new Date().toISOString().split('T')[0];
    }
    setDefaultMealType() {
        const hour = new Date().getHours();
        let meal;
        if (hour < 11)
            meal = 'Breakfast';
        else if (hour < 15)
            meal = 'Lunch';
        else if (hour < 21)
            meal = 'Dinner';
        else
            meal = 'Snacks';
        this.shadowRoot.getElementById('meal-type').value = meal;
    }
}
customElements.define('ai-estimate', AiEstimate);
