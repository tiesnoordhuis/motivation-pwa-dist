import styles from './food-log.css' with { type: 'css' };
const template = document.createElement('template');
template.innerHTML = `
    <div class="search-results" id="search-results"></div>
`;
export class FoodSearchResults extends HTMLElement {
    libraryItemsValue = [];
    offItemsValue = [];
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
    }
    set libraryItems(value) {
        this.libraryItemsValue = value;
        this.render();
    }
    set offItems(value) {
        this.offItemsValue = value;
        this.render();
    }
    clear() {
        this.libraryItemsValue = [];
        this.offItemsValue = [];
        this.render();
    }
    showEmpty(message) {
        const container = this.shadowRoot.getElementById('search-results');
        container.replaceChildren();
        const empty = document.createElement('p');
        empty.className = 'empty-state';
        empty.textContent = message;
        container.appendChild(empty);
    }
    render() {
        const container = this.shadowRoot.getElementById('search-results');
        container.replaceChildren();
        if (this.libraryItemsValue.length > 0) {
            container.appendChild(this.createSectionLabel('Your Library'));
            for (const item of this.libraryItemsValue) {
                container.appendChild(this.createLibraryRow(item));
            }
        }
        if (this.offItemsValue.length > 0) {
            container.appendChild(this.createSectionLabel('Open Food Facts'));
            for (const item of this.offItemsValue) {
                container.appendChild(this.createOffRow(item));
            }
        }
    }
    createSectionLabel(text) {
        const label = document.createElement('p');
        label.className = 'result-section-label';
        label.textContent = text;
        return label;
    }
    createLibraryRow(item) {
        const row = document.createElement('div');
        row.className = 'search-result-item';
        const info = document.createElement('div');
        info.className = 'result-info';
        const name = document.createElement('div');
        name.className = 'result-name';
        name.textContent = item.display_name;
        const brand = document.createElement('div');
        brand.className = 'result-brand';
        brand.textContent = item.brands ?? item.serving_label ?? '';
        const cal = document.createElement('div');
        cal.className = 'result-cal';
        cal.textContent = `${Math.round(item.calories ?? 0)} kcal`;
        info.appendChild(name);
        info.appendChild(brand);
        row.appendChild(info);
        row.appendChild(cal);
        row.addEventListener('click', () => this.dispatchSelectEvent('health:select-library-item', item));
        return row;
    }
    createOffRow(item) {
        const row = document.createElement('div');
        row.className = 'search-result-item';
        const info = document.createElement('div');
        info.className = 'result-info';
        const name = document.createElement('div');
        name.className = 'result-name';
        name.textContent = item.product_name;
        const brand = document.createElement('div');
        brand.className = 'result-brand';
        brand.textContent = item.brands ?? '';
        const cal = document.createElement('div');
        cal.className = 'result-cal';
        cal.textContent = `${Math.round(item.calories_per_100g ?? 0)} kcal`;
        info.appendChild(name);
        info.appendChild(brand);
        row.appendChild(info);
        row.appendChild(cal);
        row.addEventListener('click', () => this.dispatchSelectEvent('health:select-off-item', item));
        return row;
    }
    dispatchSelectEvent(type, detail) {
        const CustomEventCtor = this.ownerDocument.defaultView?.CustomEvent ?? CustomEvent;
        this.dispatchEvent(new CustomEventCtor(type, {
            bubbles: true,
            composed: true,
            detail,
        }));
    }
}
customElements.define('food-search-results', FoodSearchResults);
