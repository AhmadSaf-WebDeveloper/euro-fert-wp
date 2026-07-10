import { qs, qsa } from './utils.js';
import { initLiveSearch } from './live-search.js';
import { observeGridCards } from './animations.js';

/**
 * productArchive.js
 * Handles all interactive behaviour on the product archive page (/products/).
 *
 * Features:
 *  - CSS shimmer skeleton removal on load
 *  - Category filter pills (client-side, instant)
 *  - Live text search (via live-search.js module, 150ms debounced)
 *  - Combined filter + search
 *  - Load More (reveals cards in batches of 10)
 *  - IntersectionObserver scroll-reveal (55ms stagger)
 *  - Grid / List view toggle (persisted in localStorage)
 *  - Empty state management
 *  - Accessible count label updates (aria-live)
 */
export function initProductArchive() {

  // ── Guard: only run on the archive page ──────────────────────────────────
  const grid = qs('#productGrid');
  if (!grid) return;

  // ── DOM refs ──────────────────────────────────────────────────────────────
  const pills        = qsa('.archive-filter__pill');
  const allCards     = qsa('.product-grid__item[data-title]', grid);
  const countLabel   = qs('#archiveCount');
  const emptyState   = qs('#archiveEmpty');
  const loadMoreBtn  = qs('#loadMoreBtn');
  const loadMoreWrap = qs('#loadMoreWrapper');
  const viewGridBtn  = qs('#viewGrid');
  const viewListBtn  = qs('#viewList');

  // ── Constants ─────────────────────────────────────────────────────────────
  const BATCH       = 10;   // cards revealed per Load More click
  const INITIAL     = 15;   // cards visible without clicking Load More
  const STORAGE_KEY = 'eurofert-archive-view';

  // ── State ─────────────────────────────────────────────────────────────────
  let currentFilter = 'all';
  let currentSearch = '';    // kept in sync by live-search onUpdate callback

  // ── Boot ──────────────────────────────────────────────────────────────────
  // Remove skeleton shimmer placeholders
  grid.classList.add('is-loaded');
  // Observe the first INITIAL cards — they are already in the viewport
  observeGridCards(allCards.slice(0, INITIAL));

  // ── Live Search (delegated to live-search.js) ─────────────────────────────
  const searchHandle = initLiveSearch({
    inputId   : 'archiveSearch',
    clearId   : 'archiveSearchClear',
    items     : allCards,
    attributes: ['data-title', 'data-formula'],
    debounce  : 150,
    onUpdate  : (query /*, visibleItems */) => {
      // Sync local state then re-run the combined filter + search render pass
      currentSearch = query;
      render();
    },
  });

  // ── render(): apply current category filter + current search ──────────────
  function render() {
    let visible = 0;

    allCards.forEach(card => {
      // Cards beyond INITIAL that haven't been Load-More'd yet stay hidden
      const isOverflow = card.dataset.overflow === 'true';
      const isRevealed = card.classList.contains('is-revealed');
      if (isOverflow && !isRevealed) {
        card.classList.add('is-filtered-out');
        return;
      }

      // Category filter
      const matchesFilter =
        currentFilter === 'all' ||
        (card.dataset.categories || '').includes(currentFilter);

      // Search — live-search.js already set is-search-hidden; we just read it
      const matchesSearch = !card.classList.contains('is-search-hidden');

      const show = matchesFilter && matchesSearch;
      card.classList.toggle('is-filtered-out', !show);
      if (show) visible++;
    });

    // Update accessible count label
    if (countLabel) {
      countLabel.textContent = `${visible} Product${visible !== 1 ? 's' : ''}`;
    }

    // Empty state
    if (emptyState) {
      emptyState.hidden = visible > 0;
    }

    syncLoadMore();
  }

  // ── Load More ─────────────────────────────────────────────────────────────
  function syncLoadMore() {
    const remaining = allCards.filter(
      c => c.dataset.overflow === 'true' && !c.classList.contains('is-revealed')
    );

    if (loadMoreWrap) loadMoreWrap.hidden = remaining.length === 0;

    if (loadMoreBtn) {
      const label = qs('.load-more-label', loadMoreBtn);
      if (label) label.textContent = remaining.length > 0 ? `(${remaining.length} remaining)` : '';
    }
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      const toReveal = allCards
        .filter(c => c.dataset.overflow === 'true' && !c.classList.contains('is-revealed'))
        .slice(0, BATCH);

      toReveal.forEach(card => {
        card.dataset.overflow = 'false';
        card.classList.add('is-revealed');
        card.classList.remove('is-filtered-out');
      });

      observeGridCards(toReveal);
      render();
    });
  }

  // ── Category Filter Pills ─────────────────────────────────────────────────
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      if (pill.disabled || pill.getAttribute('aria-disabled') === 'true') return;

      currentFilter = pill.dataset.filter || 'all';

      pills.forEach(p => {
        p.classList.remove('is-active');
        p.setAttribute('aria-pressed', 'false');
      });
      pill.classList.add('is-active');
      pill.setAttribute('aria-pressed', 'true');

      // Clear search when switching category to avoid confusing combined state.
      // live-search.js exposes a clean clear() API for exactly this.
      if (searchHandle) searchHandle.clear();
      // currentSearch is reset to '' by the onUpdate callback inside clear()

      render();
    });
  });

  // ── Grid / List View Toggle ───────────────────────────────────────────────
  function applyViewMode(mode) {
    const isList = mode === 'list';
    grid.classList.toggle('archive-list-mode', isList);

    if (viewGridBtn) {
      viewGridBtn.classList.toggle('is-active', !isList);
      viewGridBtn.setAttribute('aria-pressed', String(!isList));
    }
    if (viewListBtn) {
      viewListBtn.classList.toggle('is-active', isList);
      viewListBtn.setAttribute('aria-pressed', String(isList));
    }

    try { localStorage.setItem(STORAGE_KEY, mode); } catch (_) { /* quota exceeded */ }
  }

  // Restore saved preference on load
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'list' || saved === 'grid') applyViewMode(saved);
  } catch (_) { /* private browsing */ }

  viewGridBtn?.addEventListener('click', () => applyViewMode('grid'));
  viewListBtn?.addEventListener('click', () => applyViewMode('list'));

  // ── Initial render ────────────────────────────────────────────────────────
  render();
}
