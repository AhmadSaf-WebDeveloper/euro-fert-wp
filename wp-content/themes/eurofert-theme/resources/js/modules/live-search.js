import { qs, qsa, addListener } from './utils.js';

/**
 * live-search.js
 *
 * Generic, reusable live-search module.
 * Filters a list of DOM elements by matching a query string against
 * one or more data attributes on each element.
 *
 * Zero dependencies beyond utils.js. No network requests — pure DOM filtering.
 * Suitable for any page with a small-to-medium item list (up to ~200 items).
 *
 * Usage:
 *   import { initLiveSearch } from './live-search.js';
 *
 *   const handle = initLiveSearch({
 *     inputId    : 'archiveSearch',          // ID of the <input type="search"> element
 *     clearId    : 'archiveSearchClear',     // (optional) ID of the clear button
 *     items      : Array.from(cards),        // Array or NodeList of elements to filter
 *     attributes : ['data-title', 'data-formula'], // data attributes to match against
 *     debounce   : 150,                      // (optional) ms delay, default 150
 *     onUpdate   : (query, visibleItems) => { // (optional) called after every filter pass
 *       console.log(`${visibleItems.length} results for "${query}"`);
 *     }
 *   });
 *
 *   // To programmatically clear search from another module:
 *   handle.clear();
 *
 *   // To get the current query:
 *   handle.getQuery();
 */
export function initLiveSearch({ inputId, clearId, items, attributes, debounce: debounceMs = 150, onUpdate } = {}) {

  // ── Guard: require input + at least one item ──────────────────────────────
  const input = document.getElementById(inputId);
  if (!input || !items || !items.length) return null;

  const clearBtn = clearId ? document.getElementById(clearId) : null;
  const itemsArr = Array.from(items);  // normalise NodeList → Array

  let debounceTimer = null;
  let currentQuery  = '';

  // ── Core filter function ──────────────────────────────────────────────────
  function applyFilter(rawQuery) {
    currentQuery = rawQuery.trim().toLowerCase();

    const visibleItems = [];

    itemsArr.forEach(item => {
      const matches = !currentQuery || (attributes || []).some(attr =>
        (item.getAttribute(attr) || '').toLowerCase().includes(currentQuery)
      );

      // Toggle the is-search-hidden class — the consuming module reads this
      // in its own render() to combine search + category filter correctly.
      item.classList.toggle('is-search-hidden', !matches);

      if (matches) visibleItems.push(item);
    });

    // Show / hide the clear (×) button
    if (clearBtn) clearBtn.hidden = !currentQuery;

    // Notify the consuming module (e.g. productArchive.js's render())
    if (typeof onUpdate === 'function') {
      onUpdate(currentQuery, visibleItems);
    }
  }

  // ── Input event (debounced) ───────────────────────────────────────────────
  addListener(input, 'input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => applyFilter(input.value), debounceMs);
  });

  // ── Escape key: clear and blur ────────────────────────────────────────────
  addListener(input, 'keydown', e => {
    if (e.key === 'Escape') {
      input.value = '';
      applyFilter('');
      input.blur();
    }
  });

  // ── Clear button click ────────────────────────────────────────────────────
  if (clearBtn) {
    addListener(clearBtn, 'click', () => {
      input.value = '';
      applyFilter('');
      input.focus();
    });
  }

  // ── Public API returned to the caller ─────────────────────────────────────
  return {
    /** Programmatically clear the search field and reset all items */
    clear() {
      input.value = '';
      applyFilter('');
    },
    /** Returns the current trimmed, lowercased query string */
    getQuery() {
      return currentQuery;
    },
  };
}
