/**
 * Section card expand/shrink transitions.
 *
 * Listens for two custom DOM events:
 *   - `section-navigate`  fired by <section-card> on tap → card ghost expands to full screen
 *   - `section-back`      fired by back buttons          → coloured ghost shrinks to card rect
 *
 * Call `initSectionTransitions(router)` once during app bootstrap.
 */
/** Stores the last forward-navigation geometry so back can reverse it exactly. */
let lastSection = null;
// ── Helpers ───────────────────────────────────────────────────────────────────
/** Create a plain coloured ghost positioned at the card's rect. */
function createCardGhost(rect, bgColor) {
    const ghost = document.createElement('div');
    ghost.className = 'section-expand-ghost';
    ghost.style.top = `${rect.top}px`;
    ghost.style.left = `${rect.left}px`;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.borderRadius = '20px';
    ghost.style.background = bgColor;
    document.body.appendChild(ghost);
    return ghost;
}
/** Create a plain coloured ghost covering the full screen (for back transition). */
function createFullscreenGhost(bgColor) {
    const ghost = document.createElement('div');
    ghost.className = 'section-expand-ghost';
    ghost.style.top = '0px';
    ghost.style.left = '0px';
    ghost.style.width = '100%';
    ghost.style.height = '100%';
    ghost.style.borderRadius = '0px';
    ghost.style.background = bgColor;
    document.body.appendChild(ghost);
    return ghost;
}
/** Create a standalone fixed title element for independent title animation. */
function createFloatingTitle(title, top, left) {
    const el = document.createElement('div');
    el.className = 'section-expand-ghost-title';
    el.style.position = 'fixed';
    el.style.zIndex = '10000';
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
    el.style.margin = '0';
    el.style.pointerEvents = 'none';
    el.textContent = title;
    document.body.appendChild(el);
    return el;
}
/**
 * Compute the two anchor positions for the floating title animation.
 * All values mirror the rem-based CSS constants in section-card.css and style.css.
 */
function computeTitlePositions(rect, rem) {
    const titleH = rem * 1.4; // .card-title / .section-page__title font-size
    const summaryH = rem * 0.8 * 1.4; // .card-summary font-size × line-height
    const titleMarginB = rem * 0.35; // .card-title margin-bottom
    const cardPadB = rem * 1.5; // .section-card padding-bottom
    const cardPadL = rem * 1.25; // .section-card padding-left
    const headerPadT = rem * 1; // .section-page__header padding-top
    const headerPadL = rem * 1; // .section-page__header padding-left
    const backBtnH = rem * 2.4; // .section-back-btn height
    const headerGap = rem * 0.75; // gap between back button and title
    return {
        cardTop: rect.bottom - cardPadB - summaryH - titleMarginB - titleH,
        cardLeft: rect.left + cardPadL,
        headerTop: headerPadT + (backBtnH - titleH) / 2,
        headerLeft: headerPadL + backBtnH + headerGap,
    };
}
// ── Forward: card → section page ─────────────────────────────────────────────
function onSectionNavigate(detail, router) {
    const { route, rect, bgColor, title } = detail;
    lastSection = { rect, bgColor, title };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const pos = computeTitlePositions(rect, rem);
    // Floating title declared first so the ghost's .finished.then() can safely reference it.
    const floatingTitle = createFloatingTitle(title, pos.cardTop, pos.cardLeft);
    floatingTitle.animate([
        { top: `${pos.cardTop}px`, left: `${pos.cardLeft}px` },
        { top: `${pos.headerTop}px`, left: `${pos.headerLeft}px` },
    ], { duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' });
    const ghost = createCardGhost(rect, bgColor);
    ghost.animate([
        { top: `${rect.top}px`, left: `${rect.left}px`, width: `${rect.width}px`, height: `${rect.height}px`, borderRadius: '20px' },
        { top: '0px', left: '0px', width: `${vw}px`, height: `${vh}px`, borderRadius: '0px' },
    ], { duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }).finished.then(() => {
        router.navigate(route, { skipTransition: true });
        requestAnimationFrame(() => requestAnimationFrame(() => {
            ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: 'ease-out', fill: 'forwards' }).finished.then(() => { ghost.remove(); floatingTitle.remove(); });
        }));
    });
}
// ── Reverse: section page → home ─────────────────────────────────────────────
function onSectionBack(router) {
    if (!lastSection) {
        router.navigate('#/');
        return;
    }
    const { rect, bgColor, title } = lastSection;
    lastSection = null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const pos = computeTitlePositions(rect, rem);
    // Instant full-screen cover so the home grid doesn't flash in.
    const ghost = createFullscreenGhost(bgColor);
    router.navigate('#/', { skipTransition: true });
    // Two frames for the home grid to paint, then shrink ghost + move title back to card.
    requestAnimationFrame(() => requestAnimationFrame(() => {
        const floatingTitle = createFloatingTitle(title, pos.headerTop, pos.headerLeft);
        floatingTitle.animate([
            { top: `${pos.headerTop}px`, left: `${pos.headerLeft}px` },
            { top: `${pos.cardTop}px`, left: `${pos.cardLeft}px` },
        ], { duration: 550, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' });
        ghost.animate([
            { top: '0px', left: '0px', width: `${vw}px`, height: `${vh}px`, borderRadius: '0px' },
            { top: `${rect.top}px`, left: `${rect.left}px`, width: `${rect.width}px`, height: `${rect.height}px`, borderRadius: '20px' },
        ], { duration: 550, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }).finished.then(() => { ghost.remove(); floatingTitle.remove(); });
    }));
}
// ── Bootstrap ─────────────────────────────────────────────────────────────────
export function initSectionTransitions(router) {
    document.addEventListener('section-navigate', (e) => {
        const detail = e.detail;
        onSectionNavigate(detail, router);
    });
    document.addEventListener('section-back', () => {
        onSectionBack(router);
    });
}
