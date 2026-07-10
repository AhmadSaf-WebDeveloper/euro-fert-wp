import { qsa } from './utils.js';

let gridObserver = null;

/**
 * observeGridCards
 * Reusable function to animate any grid cards (used on load AND on "Load More").
 * Dynamically applies the graceful degradation CSS class before observing.
 */
export function observeGridCards(cards) {
  if (!gridObserver || !cards || !cards.length) return;
  
  cards.forEach(card => {
    // Graceful degradation: cards are only hidden right before being observed
    card.classList.add('will-scroll-reveal');
    gridObserver.observe(card);
  });
}

/**
 * initGridAnimations
 * Initializes the central IntersectionObserver and observes static grids on page load.
 */
export function initGridAnimations() {
  if (!("IntersectionObserver" in window)) return;

  // Create ONE central observer for the entire website
  gridObserver = new IntersectionObserver((entries) => {
    const intersecting = entries.filter(e => e.isIntersecting);
    
    intersecting.forEach((entry, i) => {
      // 55ms stagger effect for premium feel
      setTimeout(() => {
        entry.target.classList.add('is-scroll-revealed');
      }, i * 55);
      
      // Stop observing once revealed to prevent memory leaks
      gridObserver.unobserve(entry.target);
    });
  }, { threshold: 0.1 }); 

  // Target all static grids on page load (Homepage, Taxonomy)
  // Archive cards are handled dynamically by productArchive.js, but
  // we could safely query all of them right here.
  const categoryCards = qsa('.category-card');
  const productCards  = qsa('.product-grid__item');
  
  observeGridCards(categoryCards);
  observeGridCards(productCards);
}
