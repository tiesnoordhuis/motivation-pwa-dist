import test from 'node:test';
import assert from 'node:assert';
import './review-card.component.js';
test('ReviewCard', async (t) => {
    await t.test('renders front and back text', () => {
        const card = document.createElement('review-card');
        card.dataset.front = 'Cảm ơn';
        card.dataset.back = 'Thank you';
        document.body.appendChild(card);
        assert.ok(card.shadowRoot);
        const front = card.shadowRoot.querySelector('.card-front');
        const back = card.shadowRoot.querySelector('.card-back');
        assert.equal(front.textContent, 'Cảm ơn');
        assert.equal(back.textContent, 'Thank you');
        card.remove();
    });
    await t.test('toggles flipped state on click', () => {
        const card = document.createElement('review-card');
        document.body.appendChild(card);
        const inner = card.shadowRoot.querySelector('.card-inner');
        assert.ok(!inner.classList.contains('is-flipped'));
        // Simulate click
        card.click();
        // Assert state is flipped
        assert.ok(inner.classList.contains('is-flipped'));
        // Reset flip back
        card.resetFlip();
        assert.ok(!inner.classList.contains('is-flipped'));
        card.remove();
    });
    await t.test('dispatches card-flipped event when clicked', (tContext) => {
        return new Promise((resolve) => {
            const card = document.createElement('review-card');
            document.body.appendChild(card);
            card.addEventListener('card-flipped', () => {
                assert.ok(true);
                card.remove();
                resolve();
            });
            card.click();
        });
    });
});
