const SECTIONS = [
    {
        id: 'health',
        title: 'Health',
        color: 'yellow',
        route: '#/health',
        getSummary: async () => 'Food tracking, workouts, activity',
    },
    {
        id: 'social',
        title: 'Social',
        color: 'green',
        route: '#/social',
        getSummary: async () => 'People tracking, interaction cadence',
    },
    {
        id: 'vietnamese',
        title: 'Learn',
        color: 'red',
        route: '#/vietnamese',
        getSummary: async () => 'Spaced repetition, progress tracking',
    },
    {
        id: 'projects',
        title: 'Projects',
        color: 'blue',
        route: '#/projects',
        getSummary: async () => 'Scrumboard, git activity, server control',
    },
];
export class HomeRenderer {
    container;
    initialized = false;
    constructor() {
        this.container = document.getElementById('home-view');
    }
    /** Initialize the home screen with title header, section card grid, and TODO footer */
    async init() {
        if (this.initialized)
            return;
        this.initialized = true;
        // App title header
        const header = document.createElement('header');
        header.className = 'home-header';
        const h1 = document.createElement('h1');
        h1.className = 'home-title';
        h1.textContent = 'Motivation';
        header.appendChild(h1);
        // 2×2 card grid
        const grid = document.createElement('div');
        grid.className = 'section-grid';
        for (const section of SECTIONS) {
            const card = document.createElement('section-card');
            card.setAttribute('title', section.title);
            card.setAttribute('color', section.color);
            card.setAttribute('route', section.route);
            card.setAttribute('summary', 'Loading…');
            card.id = `section-card-${section.id}`;
            grid.appendChild(card);
        }
        // TODO footer
        const footer = document.createElement('footer');
        footer.className = 'home-footer';
        const todoLink = document.createElement('a');
        todoLink.href = '#/todo';
        todoLink.className = 'todo-link';
        todoLink.textContent = 'TODO List';
        footer.appendChild(todoLink);
        this.container.appendChild(header);
        this.container.appendChild(grid);
        this.container.appendChild(footer);
    }
    /** Fetch and display summaries for all section cards */
    async loadSummaries() {
        const updates = SECTIONS.map(async (section) => {
            const card = document.getElementById(`section-card-${section.id}`);
            try {
                const summary = await section.getSummary();
                card?.setAttribute('summary', summary);
            }
            catch {
                card?.setAttribute('summary', 'Could not load summary');
            }
        });
        await Promise.all(updates);
    }
}
