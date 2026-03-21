import { test } from 'node:test';
import assert from 'node:assert';
function flush() {
    return Promise.resolve().then(() => undefined);
}
test('VietnameseDashboardScreen mounts the dashboard component', async () => {
    const { VietnameseDashboardScreen } = await import('./vietnamese-dashboard-screen.component.js');
    const screen = new VietnameseDashboardScreen();
    document.body.appendChild(screen);
    await flush();
    const dashboard = screen.querySelector('vietnamese-dashboard');
    assert.ok(dashboard);
    assert.ok(screen.querySelector('.section-page__content'));
    document.body.replaceChildren();
});
test('VietnameseReviewScreen mounts and cleans up the review session', async () => {
    const { VietnameseReviewScreen } = await import('./vietnamese-review-screen.component.js');
    const screen = new VietnameseReviewScreen();
    document.body.appendChild(screen);
    await flush();
    const reviewSession = screen.querySelector('review-session');
    assert.ok(reviewSession);
    screen.remove();
    assert.strictEqual(screen.querySelector('review-session'), null);
});
