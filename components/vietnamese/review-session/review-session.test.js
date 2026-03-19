import test from 'node:test';
import assert from 'node:assert';
import { VietnameseService } from '../../../services/vietnamese.service.js';
import './review-session.component.js';
async function waitFor(getValue, timeoutMs = 250) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const value = getValue();
        if (value) {
            return value;
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error('Timed out waiting for element');
}
test('ReviewSession', async (t) => {
    await t.test('shows summary when no cards due', async (tContext) => {
        tContext.mock.method(VietnameseService, 'getDueReviewCards', async () => []);
        const session = document.createElement('review-session');
        document.body.appendChild(session);
        assert.ok(session.shadowRoot);
        const summary = await waitFor(() => session.shadowRoot.querySelector('review-session-summary'));
        const summaryView = await waitFor(() => summary.shadowRoot?.querySelector('.summary-view'));
        assert.ok(summaryView.textContent?.includes('All Caught Up'));
        session.remove();
    });
    await t.test('renders first card and handles rating flow', async (tContext) => {
        tContext.mock.method(VietnameseService, 'getDueReviewCards', async () => [
            { id: 'card1', front: 'Front1', back: 'Back1' },
            { id: 'card2', front: 'Front2', back: 'Back2' }
        ]);
        const submitMock = tContext.mock.method(VietnameseService, 'submitReview', async () => ({}));
        const session = document.createElement('review-session');
        document.body.appendChild(session);
        const cardArea = await waitFor(() => session.shadowRoot.querySelector('review-card'));
        assert.ok(cardArea);
        assert.equal(cardArea.dataset.front, 'Front1');
        const progress = session.shadowRoot.querySelector('#progress');
        assert.ok(progress.textContent?.includes('2 cards remaining'));
        const controls = session.shadowRoot.querySelector('#controls');
        assert.ok(controls.hidden);
        cardArea.click();
        assert.ok(!controls.hidden);
        const goodBtn = controls.querySelector('[data-rating="3"]');
        goodBtn.click();
        await new Promise(r => setTimeout(r, 50));
        assert.equal(submitMock.mock.callCount(), 1);
        assert.deepEqual(submitMock.mock.calls[0].arguments, ['card1', 3]);
        assert.equal(cardArea.dataset.front, 'Front2');
        assert.ok(progress.textContent?.includes('1 card remaining'));
        cardArea.click();
        controls.querySelector('[data-rating="4"]').click();
        await new Promise(r => setTimeout(r, 50));
        const summary = await waitFor(() => session.shadowRoot.querySelector('review-session-summary'));
        const summaryView = await waitFor(() => summary.shadowRoot?.querySelector('.summary-view'));
        assert.ok(summaryView.textContent?.includes('2'));
        assert.ok(summaryView.textContent?.includes('3.5'));
        session.remove();
    });
});
