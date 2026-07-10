<?php get_header(); ?>

<?php
/**
 * archive-eurofert_product.php
 *
 * WordPress archive template for the `eurofert_product` custom post type.
 * Served automatically at /products/ (slug registered in mu-plugins/eurofert-post-types.php).
 *
 * Features:
 *  - eurofert_page_banner() hero with farm background image + wave divider
 *  - Toolbar: live product count, text search input, grid/list view toggle
 *  - Category filter pill bar (7 categories from fertilizer_category taxonomy)
 *  - 5-column responsive product grid (scales to 35+ products)
 *  - CSS shimmer skeleton placeholders (removed by JS on DOMContentLoaded)
 *  - First 15 cards visible; Load More reveals next 10 per click (JS)
 *  - IntersectionObserver scroll-reveal animation (JS)
 *  - Empty state (0 results)
 *  - SEO-safe hidden pagination (crawlable by Googlebot)
 *  - Back to Home link
 *
 * JavaScript: resources/js/modules/productArchive.js (bundled via webpack)
 * Styles:     resources/scss/modules/_product-archive.scss
 */

// ── Page Banner ──────────────────────────────────────────────────────────────
if ( function_exists( 'eurofert_page_banner' ) ) {
  eurofert_page_banner( [
    'title'    => 'All Products',
    'subtitle' => 'Precision-engineered fertilizers for every crop and growth stage.',
    'photo'    => get_theme_file_uri( '/public/images/hero-farm.jpg' ),
  ] );
}

// ── Data: Categories ─────────────────────────────────────────────────────────
$archive_categories = get_terms( [
  'taxonomy'   => 'fertilizer_category',
  'hide_empty' => false,
  'orderby'    => 'name',
  'order'      => 'ASC',
] );
if ( is_wp_error( $archive_categories ) ) {
  $archive_categories = [];
}

// ── Data: Total product count (used in toolbar label) ────────────────────────
global $wp_query;
$archive_total = (int) $wp_query->found_posts;

// ── Constants: Load More initial threshold (must match productArchive.js) ─────
$INITIAL_VISIBLE = 15;
?>

<main class="content products-archive" id="mainContent">

  <!-- ═══════════════════════════════════════════════════════════════════════
       TOOLBAR — count · search · view toggle
       ═══════════════════════════════════════════════════════════════════════ -->
  <section class="archive-toolbar" aria-label="Product archive toolbar">
    <div class="container">
      <div class="archive-toolbar__inner">

        <!-- Count label: updated by JS after filtering -->
        <p class="archive-toolbar__count"
           id="archiveCount"
           aria-live="polite"
           aria-atomic="true">
          <?php echo esc_html( $archive_total ); ?> Products
        </p>

        <!-- Search input -->
        <div class="archive-toolbar__search">
          <label for="archiveSearch" class="sr-only">Search products</label>
          <i class="fas fa-magnifying-glass archive-toolbar__search-icon" aria-hidden="true"></i>
          <input
            id="archiveSearch"
            type="search"
            class="archive-toolbar__search-input"
            placeholder="<?php esc_attr_e( 'Search products…', 'eurofert' ); ?>"
            autocomplete="off"
            spellcheck="false" />
          <button
            class="archive-toolbar__search-clear"
            id="archiveSearchClear"
            type="button"
            aria-label="<?php esc_attr_e( 'Clear search', 'eurofert' ); ?>"
            hidden>
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>

        <!-- Grid / List view toggle -->
        <div class="archive-toolbar__view"
             role="group"
             aria-label="<?php esc_attr_e( 'View mode', 'eurofert' ); ?>">
          <button
            class="archive-toolbar__view-btn is-active"
            id="viewGrid"
            type="button"
            aria-pressed="true"
            aria-label="<?php esc_attr_e( 'Grid view', 'eurofert' ); ?>">
            <i class="fas fa-grip" aria-hidden="true"></i>
          </button>
          <button
            class="archive-toolbar__view-btn"
            id="viewList"
            type="button"
            aria-pressed="false"
            aria-label="<?php esc_attr_e( 'List view', 'eurofert' ); ?>">
            <i class="fas fa-list" aria-hidden="true"></i>
          </button>
        </div>

      </div><!-- .archive-toolbar__inner -->
    </div><!-- .container -->
  </section><!-- .archive-toolbar -->


  <!-- ═══════════════════════════════════════════════════════════════════════
       FILTER PILLS — 7 categories from fertilizer_category taxonomy
       ═══════════════════════════════════════════════════════════════════════ -->
  <?php if ( ! empty( $archive_categories ) ) : ?>
    <section class="archive-filter" aria-label="<?php esc_attr_e( 'Filter products by category', 'eurofert' ); ?>">
      <div class="container">
        <div class="archive-filter__bar"
             role="group"
             aria-label="<?php esc_attr_e( 'Category filters', 'eurofert' ); ?>">

          <!-- "All Products" pill — active by default -->
          <button
            class="archive-filter__pill is-active"
            type="button"
            data-filter="all"
            aria-pressed="true">
            <?php esc_html_e( 'All Products', 'eurofert' ); ?>
          </button>

          <?php foreach ( $archive_categories as $cat ) :
            $has_products = ( (int) $cat->count > 0 );
          ?>
            <button
              class="archive-filter__pill<?php echo ! $has_products ? ' is-empty' : ''; ?>"
              type="button"
              data-filter="<?php echo esc_attr( $cat->slug ); ?>"
              aria-pressed="false"
              <?php echo ! $has_products ? 'disabled aria-disabled="true"' : ''; ?>
              <?php if ( ! $has_products ) : ?>
                title="<?php esc_attr_e( 'No products yet in this category', 'eurofert' ); ?>"
              <?php endif; ?>>
              <?php echo esc_html( $cat->name ); ?>
              <?php if ( $has_products ) : ?>
                <span class="archive-filter__pill-count"
                      aria-label="<?php echo esc_attr( $cat->count . ' products' ); ?>">
                  <?php echo esc_html( $cat->count ); ?>
                </span>
              <?php endif; ?>
            </button>
          <?php endforeach; ?>

        </div><!-- .archive-filter__bar -->
      </div><!-- .container -->
    </section><!-- .archive-filter -->
  <?php endif; ?>


  <!-- ═══════════════════════════════════════════════════════════════════════
       PRODUCT GRID
       ═══════════════════════════════════════════════════════════════════════ -->
  <section class="archive-grid-section product-section" id="productsSection">
    <div class="container">

      <div class="product-grid product-grid--archive" id="productGrid">

        <!-- Skeleton shimmer placeholders: shown before JS removes them.
             Gives immediate visual feedback while the page settles. -->
        <?php for ( $s = 0; $s < 10; $s++ ) : ?>
          <div class="product-grid__skeleton" aria-hidden="true"></div>
        <?php endfor; ?>

        <!-- ── Product cards ────────────────────────────────────────────── -->
        <?php
        $card_index = 0;

        if ( have_posts() ) :
          while ( have_posts() ) :
            the_post();

            // Category slugs — read by JS filter (space-separated)
            $terms     = get_the_terms( get_the_ID(), 'fertilizer_category' );
            $cat_slugs = ( $terms && ! is_wp_error( $terms ) )
              ? implode( ' ', wp_list_pluck( $terms, 'slug' ) )
              : '';

            $formula     = function_exists( 'get_field' ) ? get_field( 'formula' ) : '';
            $product_url = get_permalink();
            $base_name   = function_exists( 'get_product_base_name' )
              ? get_product_base_name( get_the_title() )
              : get_the_title();

            // Cards beyond INITIAL_VISIBLE are hidden by CSS (data-overflow="true")
            // JS reveals them in batches on Load More click.
            $is_overflow = $card_index >= $INITIAL_VISIBLE ? 'true' : 'false';

            // First 5 cards: eager-load images (they are above the fold)
            $img_loading = $card_index < 5 ? 'eager' : 'lazy';
        ?>
          <a class="product-grid__col card product-grid__item"
             href="<?php echo esc_url( $product_url ); ?>"
             data-categories="<?php echo esc_attr( $cat_slugs ); ?>"
             data-title="<?php echo esc_attr( strtolower( get_the_title() ) ); ?>"
             data-formula="<?php echo esc_attr( strtolower( (string) $formula ) ); ?>"
             data-overflow="<?php echo esc_attr( $is_overflow ); ?>"
             aria-label="<?php echo esc_attr( get_the_title() ); ?>">

            <!-- Product thumbnail -->
            <div class="product-grid__media">
              <?php
              $thumb_id = get_post_thumbnail_id( get_the_ID() );
              if ( $thumb_id ) {
                echo wp_get_attachment_image(
                  $thumb_id,
                  'product_portrait_thumb',
                  false,
                  [
                    'class'   => 'product-grid__img',
                    'alt'     => esc_attr( get_the_title() ),
                    'loading' => $img_loading,
                    'decoding' => 'async',
                  ]
                );
              }
              ?>
            </div><!-- .product-grid__media -->

            <!-- Product info -->
            <div class="product-grid__content">
              <div class="card-body product-grid__body">
                <h5 class="product-grid__title">
                  <?php echo esc_html( $base_name ); ?>
                </h5>
                <?php if ( ! empty( $formula ) ) : ?>
                  <p class="product-grid__formula">
                    <?php echo esc_html( $formula ); ?>
                  </p>
                <?php endif; ?>
              </div>
              <div class="product-grid__footer">
                <small class="product-grid__cta text-primary fw-bold">
                  <?php esc_html_e( 'View Details', 'eurofert' ); ?>
                </small>
                <i class="fas fa-arrow-right text-primary product-grid__arrow" aria-hidden="true"></i>
              </div>
            </div><!-- .product-grid__content -->

          </a><!-- .product-grid__item -->

        <?php
            $card_index++;
          endwhile;

        endif; // have_posts()
        ?>

      </div><!-- #productGrid .product-grid -->


      <!-- ── Empty state (shown by JS when 0 results) ─────────────────── -->
      <div class="archive-empty" id="archiveEmpty" hidden aria-live="polite">
        <i class="fas fa-seedling archive-empty__icon" aria-hidden="true"></i>
        <p><?php esc_html_e( 'No products found for this selection.', 'eurofert' ); ?></p>
        <small><?php esc_html_e( 'Try a different category or clear your search.', 'eurofert' ); ?></small>
      </div>

      <!-- ── Load More button ──────────────────────────────────────────── -->
      <?php if ( $archive_total > $INITIAL_VISIBLE ) : ?>
        <div class="archive-load-more" id="loadMoreWrapper">
          <button class="archive-load-more__btn" id="loadMoreBtn" type="button">
            <i class="fas fa-chevron-down" aria-hidden="true"></i>
            <?php esc_html_e( 'Load More', 'eurofert' ); ?>
            <span class="load-more-label" aria-live="polite"></span>
          </button>
        </div>
      <?php endif; ?>

      <!-- ── SEO fallback pagination ───────────────────────────────────
           Visually hidden from users; fully crawlable by Googlebot.
           Ensures all products are discoverable by search engines even
           though JS handles the "Load More" display logic client-side. -->
      <nav class="sr-only" aria-label="<?php esc_attr_e( 'Product archive pagination', 'eurofert' ); ?>">
        <?php
        echo paginate_links( [
          'type'      => 'list',
          'prev_text' => '« ' . esc_html__( 'Previous', 'eurofert' ),
          'next_text' => esc_html__( 'Next', 'eurofert' ) . ' »',
        ] );
        ?>
      </nav>

      <!-- ── Back to Home ──────────────────────────────────────────────── -->
      <div class="archive-back-nav">
        <a href="<?php echo esc_url( home_url( '/' ) ); ?>"
           class="back-nav-link"
           aria-label="<?php esc_attr_e( 'Back to Home', 'eurofert' ); ?>">
          <span class="back-nav-link__arrow" aria-hidden="true">
            <i class="fa-solid fa-arrow-left"></i>
          </span>
          <span class="back-nav-link__label"><?php esc_html_e( 'Back to Home', 'eurofert' ); ?></span>
        </a>
      </div>

    </div><!-- .container -->
  </section><!-- .archive-grid-section -->

</main><!-- .products-archive -->

<?php get_footer(); ?>
