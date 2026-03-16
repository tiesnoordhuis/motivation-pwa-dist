let homeScreen = null;
export function homeRoutes() {
    return {
        '#/': {
            view: '#home-view',
            init: () => {
                homeScreen = document.createElement('home-screen');
                document.getElementById('home-view').appendChild(homeScreen);
            },
            onEnter: async () => { await homeScreen?.loadSummaries(); },
        },
    };
}
