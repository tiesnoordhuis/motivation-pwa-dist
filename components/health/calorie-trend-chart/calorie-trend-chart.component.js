import styles from './calorie-trend-chart.css' with { type: 'css' };
const template = document.createElement('template');
template.innerHTML = `
    <div class="trend-container" id="trend-section">
        <div class="trend-chart" id="trend-chart">
            <div class="target-line" id="target-line" hidden>
                <span class="target-label" id="target-label"></span>
            </div>
            <div class="trend-bars" id="trend-bars"></div>
        </div>
        <div id="empty-state" class="empty-state" hidden>
            No nutrition data yet.
        </div>
    </div>
`;
export class CalorieTrendChart extends HTMLElement {
    _calorieTarget = 2500;
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.adoptedStyleSheets = [styles];
        shadow.appendChild(template.content.cloneNode(true));
        const stored = localStorage.getItem('health_calorie_target');
        if (stored) {
            const parsed = parseInt(stored, 10);
            if (parsed > 0)
                this._calorieTarget = parsed;
        }
    }
    set calorieTarget(value) {
        this._calorieTarget = value;
        localStorage.setItem('health_calorie_target', String(value));
        // Need to re-trigger render, but for now it's state-driven from parent or local bounds
    }
    get calorieTarget() {
        return this._calorieTarget;
    }
    set weekSummary(summaries) {
        const shadow = this.shadowRoot;
        const barsContainer = shadow.getElementById('trend-bars');
        barsContainer.replaceChildren();
        const calByDate = new Map(summaries.map(s => [s.date, s.total_calories]));
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = Temporal.Now.plainDateISO().subtract({ days: i });
            const dateStr = d.toString();
            days.push({
                date: dateStr,
                dayLabel: d.toLocaleString(undefined, { weekday: 'short' }),
                calories: calByDate.get(dateStr) ?? 0,
            });
        }
        // Pad max by 20% so bars that go over the target line have headroom
        const peak = Math.max(...days.map(d => d.calories));
        const chartCeiling = Math.max(peak, this._calorieTarget * 1.2, 1);
        const targetLine = shadow.getElementById('target-line');
        const targetLabel = shadow.getElementById('target-label');
        const targetPercent = (this._calorieTarget / chartCeiling) * 100;
        targetLine.style.bottom = `${targetPercent}%`;
        targetLabel.textContent = `${this._calorieTarget}`;
        targetLine.hidden = false;
        for (const day of days) {
            const wrapper = document.createElement('div');
            wrapper.className = 'trend-bar-wrapper';
            const bar = document.createElement('div');
            bar.className = 'trend-bar';
            const heightPercent = (day.calories / chartCeiling) * 100;
            bar.style.height = `${heightPercent}%`;
            // Highlight bars above target subtly
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
        shadow.getElementById('trend-chart').hidden = !hasTrendData;
        shadow.getElementById('empty-state').hidden = hasTrendData;
    }
}
customElements.define('calorie-trend-chart', CalorieTrendChart);
