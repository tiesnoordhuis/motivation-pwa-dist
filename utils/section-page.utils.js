/**
 * Shared utility for building section page DOM structure.
 *
 * Every section page gets: coloured header (back button + title) + scrollable content area.
 * Replaces the inline HTML that was previously hardcoded in index.html.
 */
/**
 * Populate a bare container `<div id="…-view">` with the standard section-page
 * structure: coloured header (back button + title) and a content wrapper.
 *
 * The back button uses `history.back()` for all navigation — the browser history
 * and the hash-based router handle the rest.
 */
export function buildSectionPage(container, title, colorModifier, _sectionHash) {
    // Ensure section-page classes
    container.classList.add('section-page', `section-page--${colorModifier}`);
    container.replaceChildren();
    // Header
    const header = document.createElement('div');
    header.className = 'section-page__header';
    const backBtn = document.createElement('button');
    backBtn.className = 'section-back-btn';
    backBtn.setAttribute('aria-label', 'Back');
    backBtn.textContent = '\u2190'; // ←
    backBtn.addEventListener('click', () => {
        history.back();
    });
    const titleEl = document.createElement('h2');
    titleEl.className = 'section-page__title';
    titleEl.textContent = title;
    header.appendChild(backBtn);
    header.appendChild(titleEl);
    container.appendChild(header);
    // Content wrapper
    const content = document.createElement('div');
    content.className = 'section-page__content';
    container.appendChild(content);
    return { header, content, backBtn };
}
