import styles from './nutrition-widget.css' with { type: 'css' };
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const template = document.createElement('template');
template.innerHTML = `
    <div class="nutrition-widget">
        <div id="today-summary" class="today-summary">
            <div class="summary-item">
                <div class="summary-value" id="today-cal">0</div>
                <div class="summary-label">kcal</div>
            </div>
            <div class="summary-item">
                <div class="summary-value" id="today-protein">0g</div>
                <div class="summary-label">protein</div>
            </div>
            <div class="summary-item">
                <div class="summary-value" id="today-carbs">0g</div>
                <div class="summary-label">carbs</div>
            </div>
            <div class="summary-item">
                <div class="summary-value" id="today-fat">0g</div>
                <div class="summary-label">fat</div>
            </div>
        </div>

        <div id="trend-section" class="trend-container">
            <div class="trend-title">7-day calorie trend</div>
            <div class="trend-chart" id="trend-chart">
                <div class="target-line" id="target-line">
                    <span class="target-label" id="target-label"></span>
                </div>
                <div class="trend-bars" id="trend-bars"></div>
            </div>
        </div>

        <div id="empty-state" class="empty-state" style="display:none">
            No nutrition data yet. Scan or search food to start tracking!
        </div>
    </div>
`;
export class NutritionWidget extends HTMLElement {
    _calorieTarget = 2000;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
        // Load calorie target from localStorage
        const stored = localStorage.getItem('health_calorie_target');
        if (stored) {
            const parsed = parseInt(stored, 10);
            if (parsed > 0)
                this._calorieTarget = parsed;
        }
    }
    /** Set the daily calorie target (renders target line on chart) */
    set calorieTarget(value) {
        this._calorieTarget = value;
        localStorage.setItem('health_calorie_target', String(value));
    }
    get calorieTarget() {
        return this._calorieTarget;
    }
    /** Set today's nutrition entries to calculate today's summary */
    set todayEntries(entries) {
        const shadow = this.shadowRoot;
        const totalCal = entries.reduce((sum, e) => sum + (e.calories ?? 0), 0);
        const totalProtein = entries.reduce((sum, e) => sum + (e.protein_g ?? 0), 0);
        const totalCarbs = entries.reduce((sum, e) => sum + (e.carbs_g ?? 0), 0);
        const totalFat = entries.reduce((sum, e) => sum + (e.fat_g ?? 0), 0);
        shadow.getElementById('today-cal').textContent = String(Math.round(totalCal));
        shadow.getElementById('today-protein').textContent = `${Math.round(totalProtein)}g`;
        shadow.getElementById('today-carbs').textContent = `${Math.round(totalCarbs)}g`;
        shadow.getElementById('today-fat').textContent = `${Math.round(totalFat)}g`;
        this.updateEmptyState(entries.length > 0);
    }
    /** Set 7-day summary for trend chart */
    set weekSummary(summaries) {
        const shadow = this.shadowRoot;
        const barsContainer = shadow.getElementById('trend-bars');
        barsContainer.innerHTML = '';
        // Build a map of date → calories
        const calByDate = new Map(summaries.map(s => [s.date, s.total_calories]));
        // Generate last 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); // TODO change to Temporal
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayOfWeek = d.getDay();
            // Convert JS day (0=Sun) to our label
            const label = WEEKDAYS[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
            days.push({
                date: dateStr,
                dayLabel: label,
                calories: calByDate.get(dateStr) ?? 0,
            });
        }
        // Scale bars relative to the max of actual calories and target
        const maxCal = Math.max(...days.map(d => d.calories), this._calorieTarget, 1);
        // Position the target line
        const targetLine = shadow.getElementById('target-line');
        const targetLabel = shadow.getElementById('target-label');
        const targetPercent = (this._calorieTarget / maxCal) * 100;
        targetLine.style.bottom = `${targetPercent}%`;
        targetLabel.textContent = `${this._calorieTarget}`;
        targetLine.style.display = '';
        for (const day of days) {
            const wrapper = document.createElement('div');
            wrapper.className = 'trend-bar-wrapper';
            const bar = document.createElement('div');
            bar.className = 'trend-bar';
            const heightPercent = (day.calories / maxCal) * 100;
            bar.style.height = `${heightPercent}%`;
            // Highlight bars above target
            if (day.calories > this._calorieTarget) {
                bar.classList.add('over-target');
            }
            const calLabel = document.createElement('div');
            calLabel.className = 'trend-cal';
            calLabel.textContent = day.calories > 0 ? String(day.calories) : '';
            const dayLabel = document.createElement('div');
            dayLabel.className = 'trend-day';
            dayLabel.textContent = day.dayLabel;
            wrapper.appendChild(calLabel);
            wrapper.appendChild(bar);
            wrapper.appendChild(dayLabel);
            barsContainer.appendChild(wrapper);
        }
        const hasTrendData = summaries.length > 0;
        shadow.getElementById('trend-section').style.display = hasTrendData ? '' : 'none';
        this.updateEmptyState(hasTrendData);
    }
    updateEmptyState(hasData) {
        this.shadowRoot.getElementById('empty-state').style.display = hasData ? 'none' : '';
    }
}
customElements.define('nutrition-widget', NutritionWidget);
