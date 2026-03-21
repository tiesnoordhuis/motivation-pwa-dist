import { test, mock } from 'node:test';
import assert from 'node:assert';
function flush() {
    return Promise.resolve().then(() => undefined);
}
test('HealthAiEstimateScreen wires estimate requests to HealthService', async () => {
    const { HealthAiEstimateScreen } = await import('./health-ai-estimate-screen.component.js');
    const { HealthService } = await import('../../services/health.service.js');
    const estimateResponse = {
        estimate: {
            food_name: 'Pho',
            calories: 600,
            protein_g: 30,
            carbs_g: 70,
            fat_g: 20,
            fiber_g: 4,
            sugar_g: 5,
            confidence: 'medium',
            notes: 'Estimated from description',
        },
        model: 'llama-test',
    };
    const estimateMock = mock.method(HealthService, 'estimateNutrition', async () => estimateResponse);
    try {
        const screen = new HealthAiEstimateScreen();
        screen.date = '2026-03-21';
        screen.meal = 'Dinner';
        document.body.appendChild(screen);
        await flush();
        const aiEstimate = screen.querySelector('ai-estimate');
        assert.ok(aiEstimate);
        const CustomEventCtor = aiEstimate.ownerDocument.defaultView.CustomEvent;
        const event = new CustomEventCtor('health:estimate-nutrition', {
            bubbles: true,
            composed: true,
            detail: {
                description: 'bowl of pho',
                image: 'base64img',
                respondWith: null,
            },
        });
        aiEstimate.dispatchEvent(event);
        const result = await event.detail.respondWith;
        assert.strictEqual(estimateMock.mock.callCount(), 1);
        assert.deepStrictEqual(estimateMock.mock.calls[0].arguments, ['bowl of pho', 'base64img']);
        assert.deepStrictEqual(result, estimateResponse);
    }
    finally {
        mock.restoreAll();
        document.body.replaceChildren();
    }
});
test('HealthAiEstimateScreen saves estimates and returns to previous screen', async () => {
    const { HealthAiEstimateScreen } = await import('./health-ai-estimate-screen.component.js');
    const { HealthService } = await import('../../services/health.service.js');
    const createMock = mock.method(HealthService, 'createNutritionEntry', async (entry) => ({
        id: 1,
        created_at: '2026-03-21T12:00:00Z',
        ...entry,
    }));
    const originalBack = window.history.back.bind(window.history);
    let backCalls = 0;
    window.history.back = () => { backCalls++; };
    try {
        window.history.pushState(null, '', '#/health');
        window.history.pushState(null, '', '#/health/ai-estimate');
        const screen = new HealthAiEstimateScreen();
        document.body.appendChild(screen);
        await flush();
        const aiEstimate = screen.querySelector('ai-estimate');
        assert.ok(aiEstimate);
        const CustomEventCtor = aiEstimate.ownerDocument.defaultView.CustomEvent;
        aiEstimate.dispatchEvent(new CustomEventCtor('health:log-ai-estimate', {
            bubbles: true,
            composed: true,
            detail: {
                food_name: 'Pho',
                meal_type: 'Dinner',
                date: '2026-03-21',
                calories: 600,
                protein_g: 30,
                carbs_g: 70,
                fat_g: 20,
                fiber_g: 4,
                sugar_g: 5,
                source: 'ai_estimate',
                source_ref: 'llama-test',
            },
        }));
        await flush();
        assert.strictEqual(createMock.mock.callCount(), 1);
        assert.strictEqual(backCalls, 1);
    }
    finally {
        window.history.back = originalBack;
        window.history.replaceState(null, '', '/');
        mock.restoreAll();
        document.body.replaceChildren();
    }
});
