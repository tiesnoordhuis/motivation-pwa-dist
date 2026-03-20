const SECTION_SUMMARIES = {
    'section-card-health': async () => 'Food tracking, workouts, activity',
    'section-card-social': async () => 'People tracking, interaction cadence',
    'section-card-vietnamese': async () => 'Spaced repetition, progress tracking',
    'section-card-projects': async () => 'Scrumboard, git activity, server control',
};
const template = document.createElement('template');
template.innerHTML = `
    <header class="home-header">
        <h1 class="home-title">Motivation</h1>
    </header>
    <main class="section-grid">
        <health-section-card id="section-card-health"></health-section-card>
        <social-section-card id="section-card-social"></social-section-card>
        <learn-section-card id="section-card-vietnamese"></learn-section-card>
        <projects-section-card id="section-card-projects"></projects-section-card>
    </main>
    <home-footer class="home-footer"></home-footer>
`;
export class HomeScreen extends HTMLElement {
    ensureContent() {
        if (!this.firstChild) {
            this.appendChild(template.content.cloneNode(true));
        }
    }
    connectedCallback() {
        this.ensureContent();
    }
    async loadSummaries() {
        this.ensureContent();
        const updates = Object.entries(SECTION_SUMMARIES).map(async ([id, getSummary]) => {
            const card = this.querySelector(`#${id}`);
            try {
                const summary = await getSummary();
                card?.setAttribute('summary', summary);
            }
            catch {
                card?.setAttribute('summary', 'Could not load summary');
            }
        });
        await Promise.all(updates);
    }
}
customElements.define('home-screen', HomeScreen);
