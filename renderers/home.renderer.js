const SECTIONS = [
    {
        id: 'health',
        title: 'Personal Health',
        icon: '🟡',
        color: 'yellow',
        route: '#/health',
        getSummary: async () => 'Food tracking, workouts, activity',
    },
    {
        id: 'social',
        title: 'Social Life',
        icon: '🟢',
        color: 'green',
        route: '#/social',
        getSummary: async () => 'People tracking, interaction cadence',
    },
    {
        id: 'vietnamese',
        title: 'Learning Vietnamese',
        icon: '🔴',
        color: 'red',
        route: '#/vietnamese',
        getSummary: async () => 'Spaced repetition, progress tracking',
    },
    {
        id: 'projects',
        title: 'Software Projects',
        icon: '🔵',
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
    /** Initialize the home screen with section cards and a TODO link */
    async init() {
        if (this.initialized)
            return;
        this.initialized = true;
        const grid = document.createElement('div');
        grid.className = 'section-grid';
        for (const section of SECTIONS) {
            const card = document.createElement('section-card');
            card.setAttribute('icon', section.icon);
            card.setAttribute('title', section.title);
            card.setAttribute('color', section.color);
            card.setAttribute('route', section.route);
            card.setAttribute('summary', 'Loading…');
            card.id = `section-card-${section.id}`;
            grid.appendChild(card);
        }
        // TODO link — secondary placement, not a full section card
        const todoLink = document.createElement('a');
        todoLink.href = '#/todo';
        todoLink.className = 'todo-link';
        todoLink.innerHTML = '📝 <span>TODO List</span>';
        this.container.appendChild(grid);
        this.container.appendChild(todoLink);
    }
    /** Fetch and display summaries for all section cards */
    async loadSummaries() {
        const updates = SECTIONS.map(async (section) => {
            try {
                const summary = await section.getSummary();
                const card = document.getElementById(`section-card-${section.id}`);
                if (card) {
                    card.setAttribute('summary', summary);
                }
            }
            catch {
                const card = document.getElementById(`section-card-${section.id}`);
                if (card) {
                    card.setAttribute('summary', 'Could not load summary');
                }
            }
        });
        await Promise.all(updates);
    }
}
