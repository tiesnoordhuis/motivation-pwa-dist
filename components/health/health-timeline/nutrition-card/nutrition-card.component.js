import styles from './nutrition-card.css' with { type: 'css' };
const template = document.createElement('template');
template.innerHTML = `
    <div class="nutrition-card">
        <div class="nc-header">
            <span class="nc-icon">🍽️</span>
            <span class="nc-calories" id="nc-cal">0 kcal</span>
        </div>
        <div class="nc-macros">
            <span class="nc-macro" id="nc-p">P:0</span>
            <span class="nc-macro" id="nc-c">C:0</span>
            <span class="nc-macro" id="nc-f">F:0</span>
        </div>
    </div>
`;
export class NutritionCard extends HTMLElement {
    _entries = [];
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    set entries(val) {
        this._entries = val;
        this.render();
    }
    render() {
        if (!this._entries || this._entries.length === 0)
            return;
        const totalCal = this._entries.reduce((sum, e) => sum + (e.calories ?? 0), 0);
        const totalProtein = this._entries.reduce((sum, e) => sum + (e.protein_g ?? 0), 0);
        const totalCarbs = this._entries.reduce((sum, e) => sum + (e.carbs_g ?? 0), 0);
        const totalFat = this._entries.reduce((sum, e) => sum + (e.fat_g ?? 0), 0);
        const shadow = this.shadowRoot;
        shadow.getElementById('nc-cal').textContent = `${Math.round(totalCal)} kcal`;
        shadow.getElementById('nc-p').textContent = `P:${Math.round(totalProtein)}`;
        shadow.getElementById('nc-c').textContent = `C:${Math.round(totalCarbs)}`;
        shadow.getElementById('nc-f').textContent = `F:${Math.round(totalFat)}`;
    }
}
customElements.define('nutrition-card', NutritionCard);
