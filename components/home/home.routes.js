function createHomeScreen() {
    const screen = document.createElement('home-screen');
    screen.className = 'home-screen';
    return screen;
}
export function homeRoutes() {
    return {
        '#/': {
            render: async () => {
                const screen = createHomeScreen();
                await screen.loadSummaries();
                return screen;
            },
        },
    };
}
